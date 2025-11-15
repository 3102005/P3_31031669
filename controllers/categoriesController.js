const { Category } = require('../models');

const categoriesController = {
  // GET /categories - PROTEGIDO
  async getCategories(req, res) {
    try {
      const categories = await Category.findAll();
      res.json({
        status: 'success',
        data: categories
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  },

  // GET /categories/:id - PROTEGIDO
  async getCategoryById(req, res) {
    try {
      const category = await Category.findByPk(req.params.id);
      
      if (!category) {
        return res.status(404).json({
          status: 'error',
          message: 'Category not found'
        });
      }

      res.json({
        status: 'success',
        data: category
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  },

  // POST /categories - PROTEGIDO
  async createCategory(req, res) {
    try {
      const category = await Category.create(req.body);
      res.status(201).json({
        status: 'success',
        data: category
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  },

  // PUT /categories/:id - PROTEGIDO
  async updateCategory(req, res) {
    try {
      const category = await Category.findByPk(req.params.id);
      
      if (!category) {
        return res.status(404).json({
          status: 'error',
          message: 'Category not found'
        });
      }

      await category.update(req.body);
      res.json({
        status: 'success',
        data: category
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  },

  // DELETE /categories/:id - PROTEGIDO
  async deleteCategory(req, res) {
    try {
      const category = await Category.findByPk(req.params.id);
      
      if (!category) {
        return res.status(404).json({
          status: 'error',
          message: 'Category not found'
        });
      }

      await category.destroy();
      res.json({
        status: 'success',
        data: null,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
};

module.exports = categoriesController;