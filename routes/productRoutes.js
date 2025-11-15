// src/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate } = require('../middleware/auth');

// Rutas públicas
router.get('/', productController.getProducts); // Listado con filtros
router.get('/p/:id-:slug', productController.getProductBySlug); // Self-healing

// Rutas protegidas
router.use(authenticate);
router.post('/', productController.createProduct);
router.get('/:id', productController.getProductById);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;