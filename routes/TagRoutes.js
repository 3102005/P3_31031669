// routes/tagRoutes.js - NUEVO ARCHIVO
const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const { authenticate } = require('../middleware/auth');

// Todas las rutas protegidas por JWT
router.use(authenticate);

router.get('/', tagController.getAllTags);
router.post('/', tagController.createTag);
router.put('/:id', tagController.updateTag);
router.delete('/:id', tagController.deleteTag);

module.exports = router;