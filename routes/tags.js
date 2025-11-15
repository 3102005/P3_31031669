const express = require('express');
const router = express.Router();
const tagsController = require('../controllers/tagController');
const { authenticateToken } = require('../middleware/auth');

// Todas las rutas protegidas
router.get('/', authenticateToken, tagsController.getTags);
router.get('/:id', authenticateToken, tagsController.getTagById);
router.post('/', authenticateToken, tagsController.createTag);
router.put('/:id', authenticateToken, tagsController.updateTag);
router.delete('/:id', authenticateToken, tagsController.deleteTag);

module.exports = router;