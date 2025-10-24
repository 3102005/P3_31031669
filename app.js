var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var swaggerJsdoc = require('swagger-jsdoc');
var swaggerUi = require('swagger-ui-express');

// Importar inicialización de BD
const initializeDatabase = require('./models/init');

var app = express();

// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API DE 31031669 - Task 1',
      version: '1.0.0',
      description: 'API RESTful con autenticación JWT y gestión de usuarios',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./app.js', './controllers/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Inicializar base de datos
initializeDatabase();

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Importar controladores
const authController = require('./controllers/authController');
const userController = require('./controllers/userController');
const { authenticateToken } = require('./middleware/auth');

/**
 * @swagger
 * /ping:
 *   get:
 *     summary: Health check endpoint
 *     responses:
 *       200:
 *         description: Servidor funcionando
 */
app.get('/ping', function(req, res) {
  res.status(200).send();
});

/**
 * @swagger
 * /about:
 *   get:
 *     summary: Obtiene información del desarrollador
 *     description: Retorna información personal del desarrollador en formato JSend
 *     responses:
 *       200:
 *         description: Información obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     nombreCompleto:
 *                       type: string
 *                       example: "Cristhian Alfonzo Angyalbert Padrón Álvarez"
 *                     cedula:
 *                       type: string
 *                       example: "31031669"
 *                     seccion:
 *                       type: string
 *                       example: "2"
 */
app.get('/about', function(req, res) {
  res.json({
    status: "success",
    data: {
      nombreCompleto: "Cristhian Alfonzo Angyalbert Padrón Alvarez",
      cedula: "31031669",
      seccion: "2"
    }
  });
});

// Rutas de Autenticación (Públicas)
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombreCompleto
 *               - email
 *               - password
 *               - cedula
 *               - seccion
 *             properties:
 *               nombreCompleto:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               cedula:
 *                 type: string
 *               seccion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Error en los datos
 */
app.post('/auth/register', authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales inválidas
 */
app.post('/auth/login', authController.login);

// Rutas de Usuarios (Protegidas)
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *       401:
 *         description: No autorizado
 */
app.get('/users', authenticateToken, userController.getAllUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: Usuario no encontrado
 */
app.get('/users/:id', authenticateToken, userController.getUserById);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Crear nuevo usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombreCompleto
 *               - email
 *               - password
 *               - cedula
 *               - seccion
 *             properties:
 *               nombreCompleto:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               cedula:
 *                 type: string
 *               seccion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario creado
 *       400:
 *         description: Error en los datos
 */
app.post('/users', authenticateToken, userController.createUser);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Actualizar usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombreCompleto:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               seccion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       404:
 *         description: Usuario no encontrado
 */
app.put('/users/:id', authenticateToken, userController.updateUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Eliminar usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *       404:
 *         description: Usuario no encontrado
 */
app.delete('/users/:id', authenticateToken, userController.deleteUser);

// Manejador de errores 404
app.use(function(req, res, next) {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint no encontrado'
  });
});

// Manejador de errores general
app.use(function(err, req, res, next) {
  console.error('❌ Error del servidor:', err.stack);
  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor'
  });
});

module.exports = app;