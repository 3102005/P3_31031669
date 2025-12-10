const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const { sequelize, Category, Tag, Product } = require('./models/index');

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
const productsController = require('./controllers/productController');

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

// Si la app corre detrás de un proxy (Render, Heroku, etc.), activar trust proxy
// para que `req.protocol` refleje correctamente `X-Forwarded-Proto` (https).
app.set('trust proxy', true);

// Middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// CORS: usar paquete `cors` y permitir configuración vía variables de entorno
// En producción (Render) defina `CORS_ORIGIN` como el origen del frontend
// (por ejemplo: https://misitio-frontend.com) o una lista separada por comas.
// Si necesita cookies/credenciales, ponga `CORS_ALLOW_CREDENTIALS=true` y
// establezca `CORS_ORIGIN` explícitamente (no use '*').
const cors = require('cors');

const corsOriginEnv = process.env.CORS_ORIGIN || null; // e.g. 'https://mi-frontend.com'
const allowedOrigins = corsOriginEnv ? corsOriginEnv.split(',').map(s => s.trim()) : null;

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like curl, postman, server-to-server)
    if (!origin) return callback(null, true);
    // if no allowedOrigins configured, allow any origin
    if (!allowedOrigins) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: process.env.CORS_ALLOW_CREDENTIALS === 'true'
};

app.use(cors(corsOptions));
// Small jsend-like helper on `res` for controllers that expect `res.jsend`
app.use((req, res, next) => {
  res.jsend = {
    success: (payload) => res.json({ status: 'success', data: payload }),
    fail: (message) => res.status(400).json({ status: 'fail', message }),
    error: (message) => res.status(500).json({ status: 'error', message })
  };
  next();
});
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

// Nota: No crear/forzar la BD de tests aquí para evitar condiciones de carrera.
// Durante tests se admite un login de prueba que no requiere un usuario real.

// Rutas
app.use('/', indexRouter);
app.use('/auth', require('./routes/auth'));
app.use('/users', require('./routes/users'));
app.use('/products', productsRouter);
app.use('/categories', categoriesRouter);
app.use('/tags', tagsRouter);
// Evitar montajes duplicados: los routers principales ya están importados arriba.

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

// Manejador de rutas no encontradas (esperado por los tests)
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Manejador de errores global (registra la traza y devuelve JSON)
app.use((err, req, res, next) => {
  console.error(err && err.stack ? err.stack : err);
  res.status(err && err.status ? err.status : 500).json({
    status: 'error',
    message: err && err.message ? err.message : 'Internal Server Error'
  });
});

module.exports = app;