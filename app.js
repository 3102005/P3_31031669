var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var swaggerJsdoc = require('swagger-jsdoc');
var swaggerUi = require('swagger-ui-express');

var app = express();

// Configuración de Swagger - DEBE IR PRIMERO
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API P3_31031669',
      version: '1.0.0',
      description: 'API RESTful para el proyecto P3_31031669',
    },
  },
  apis: [path.join(__dirname, 'app.js')], // Ruta absoluta
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// SWAGGER UI - Esto es crucial
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /ping:
 *   get:
 *     summary: Health check endpoint
 *     description: Verifica que el servidor esté funcionando
 *     responses:
 *       200:
 *         description: Servidor funcionando correctamente
 */
app.get('/ping', function(req, res) {
  res.status(200).send();
});

/**
 * @swagger
 * /about:
 *   get:
 *     summary: Obtiene información del desarrollador
 *     responses:
 *       200:
 *         description: Información del desarrollador
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     nombreCompleto:
 *                       type: string
 *                     cedula:
 *                       type: string
 *                     seccion:
 *                       type: string
 */
app.get('/about', function(req, res) {
  res.json({
    status: "success",
    data: {
      nombreCompleto: "Cristhian Alfonzo Angyalbert Padron",
      cedula: "31031669",
      seccion: "2"
    }
  });
});

// Ruta principal (opcional)
app.get('/', function(req, res) {
  res.json({ 
    message: 'Bienvenido a la API P3',
    endpoints: {
      docs: '/api-docs',
      about: '/about', 
      ping: '/ping'
    }
  });
});

// Manejador de errores 404
app.use(function(req, res, next) {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    availableEndpoints: ['/api-docs', '/about', '/ping']
  });
});

module.exports = app;