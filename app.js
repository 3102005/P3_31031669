const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const { sequelize } = require('./models/index');
const { Category, Tag, Product } = require('./models/associations');

const seedDatabase = async () => {
  try {
    await sequelize.sync({ force: false });
    
    // Crear categorías por defecto
    const categories = await Category.bulkCreate([
      { name: 'Avengers', description: 'Películas de Avengers' },
      { name: 'Iron Man', description: 'Figuras de Iron Man' },
      { name: 'Captain America', description: 'Figuras de Captain America' }
    ], { ignoreDuplicates: true });

    // Crear tags por defecto
    const tags = await Tag.bulkCreate([
      { name: 'limited-edition' },
      { name: 'exclusive' },
      { name: 'glow-in-dark' },
      { name: 'jumbo-size' }
    ], { ignoreDuplicates: true });

    console.log('✅ Database seeded successfully');
  } catch (error) {
    console.error('❌ Seeding error:', error);
  }
};

// Seed the database only when not running tests (tests manage their own DB)
if (process.env.NODE_ENV !== 'test') {
  seedDatabase();
}

// Importar rutas
const indexRouter = require('./routes/index');
const productsRouter = require('./routes/products');
const categoriesRouter = require('./routes/categories');
const tagsRouter = require('./routes/tags');
const productsController = require('./controllers/productsController');

// Cargar swagger con manejo de errores y ruta absoluta
let swaggerDocument;
try {
  const swaggerPath = path.resolve(__dirname, 'swagger.yaml');
  swaggerDocument = YAML.load(swaggerPath);
} catch (err) {
  console.error('Swagger load error:', err && err.message ? err.message : err);
  swaggerDocument = null;
}
const app = express();

// Middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
if (swaggerDocument) {
  // Serve swagger UI but inject a servers entry based on incoming request
  app.use('/api-docs', swaggerUi.serve, (req, res) => {
    try {
      const doc = JSON.parse(JSON.stringify(swaggerDocument));
      const host = req.get('host'); // includes port when present
      const proto = req.protocol;
      doc.servers = [{ url: `${proto}://${host}`, description: 'Server (auto)'}];
      // Call setup middleware with the modified doc
      return swaggerUi.setup(doc)(req, res);
    } catch (err) {
      console.error('Error preparing swagger doc:', err && err.message ? err.message : err);
      return res.status(500).send('Swagger error');
    }
  });
} else {
  console.warn('Swagger documentation not available');
}
// Sincronizar base de datos al arrancar la aplicación (no durante tests)
if (process.env.NODE_ENV !== 'test') {
  sequelize.sync({ force: false })
    .then(() => {
      console.log('✅ Database synchronized');
    })
    .catch(err => {
      console.error('❌ Database sync error:', err);
    });
}

// Rutas
app.use('/', indexRouter);
app.use('/auth', require('./routes/auth'));
app.use('/users', require('./routes/users'));
app.use('/products', productsRouter);
app.use('/categories', categoriesRouter);
app.use('/tags', tagsRouter);

// Ruta pública de producto 'self-healing' accesible desde la raíz (/p/:id-:slug)
app.get('/p/:id-:slug', productsController.getProductBySlug);

// Endpoint about existente
app.get('/about', (req, res) => {
  res.json({
    status: 'success',
    data: {
      nombreCompleto: 'Cristhian Alfonzo Angyalbert Padrón Álvarez',
      cedula: '31031669',
      seccion: '1'
    }
  });
});

// Endpoint ping existente
app.get('/ping', (req, res) => {
  res.status(200).end();
});

module.exports = app;

// Manejador de rutas no encontradas (esperado por los tests)
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});