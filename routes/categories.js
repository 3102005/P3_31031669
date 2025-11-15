const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categoriesController');
const { authenticateToken } = require('../middleware/auth');

// Todas las rutas protegidas
router.get('/', authenticateToken, categoriesController.getCategories);
router.get('/:id', authenticateToken, categoriesController.getCategoryById);
router.post('/', authenticateToken, categoriesController.createCategory);
router.put('/:id', authenticateToken, categoriesController.updateCategory);
router.delete('/:id', authenticateToken, categoriesController.deleteCategory);

module.exports = router;