const express = require('express');
const router = express.Router();
const validateOrder = require('../middleware/validateOrder');

// Inyectar dependencias
const Order = require('../models').Order;
const OrderRepository = require('../repositories/OrderRepository');
const ProductRepository = require('../repositories/ProductRepository');
const OrderService = require('../services/OrderService');
const OrderController = require('../controllers/OrderController');
const auth = require('../middleware/auth').authenticate; // usar la función middleware

// Inicializar
const orderRepository = new OrderRepository(Order);
const productRepository = new ProductRepository(require('../models').Product);
const orderService = new OrderService(orderRepository, productRepository);
const orderController = new OrderController(orderService);

// Rutas PROTEGIDAS
router.use(auth); // Todas las rutas requieren autenticación

// POST /orders - Crear orden (con validación)
router.post('/', validateOrder, orderController.createOrder);

// GET /orders - Historial de órdenes
router.get('/', orderController.getOrders);

// GET /orders/:id - Detalle de orden
router.get('/:id', orderController.getOrderById);

module.exports = router;