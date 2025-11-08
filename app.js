// app.js
require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const app = express();

// Nota: la sincronización de la base de datos se realiza en el binario (./bin/www)
// para evitar efectos secundarios cuando `app` es requerido por tests.

// Middleware
app.use(express.json());

// Rutas
app.use('/auth', require('./routes/auth'));
app.use('/users', require('./routes/users'));

// Swagger
try {
  const fs = require('fs');
  const swaggerPath = './swagger.yaml';
  if (fs.existsSync(swaggerPath)) {
    const swaggerDocument = YAML.load(swaggerPath);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  } else {
    console.log('No swagger.yaml found — /api-docs disabled');
  }
} catch (error) {
  console.log('Error loading swagger documentation:', error.message || error);
}

// Health check
app.get('/ping', (req, res) => {
  res.status(200).send('');
});

app.get('/about', (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      nombreCompleto: "Estefani Jeannielys Gonzalez Gonzalez",
      cedula: "32057736",
      seccion: "1"
    }
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'success',
    data: { 
      status: 'OK', 
      message: 'Server is running',
      timestamp: new Date().toISOString()
    }
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

module.exports = app;