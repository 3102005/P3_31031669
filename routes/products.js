const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productController');
const { authenticateToken } = require('../middleware/auth');

// Rutas PÚBLICAS
router.get('/', productsController.getProducts); // GET /products
router.get('/p/:id-:slug', productsController.getProductBySlug); // GET /p/123-slug

// Rutas PROTEGIDAS (Admin)
router.get('/:id', authenticateToken, productsController.getProductById); // GET /products/:id
router.post('/', authenticateToken, productsController.createProduct); // POST /products
router.put('/:id', authenticateToken, productsController.updateProduct); // PUT /products/:id
router.delete('/:id', authenticateToken, productsController.deleteProduct); // DELETE /products/:id

module.exports = router;