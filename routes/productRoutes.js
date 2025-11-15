// routes/productRoutes.js - ACTUALIZAR ARCHIVO EXISTENTE
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate } = require('../middleware/auth');

// ✅ RUTAS PÚBLICAS (estas deben ir ANTES del middleware de auth)
router.get('/', productController.getProducts); // Listado público con filtros
router.get('/p/:id-:slug', productController.getProductBySlug); // Self-healing URL

// ✅ RUTAS PROTEGIDAS
router.use(authenticate); // Aplica auth a todas las rutas siguientes
router.get('/:id', productController.getProductById);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;