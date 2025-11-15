const { Tag } = require('../models/associations');

const tagsController = {
  // GET /tags - PROTEGIDO
  async getTags(req, res) {
    try {
      const tags = await Tag.findAll();
      res.json({
        status: 'success',
        data: tags
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  },

  // GET /tags/:id - PROTEGIDO
  async getTagById(req, res) {
    try {
      const tag = await Tag.findByPk(req.params.id);
      
      if (!tag) {
        return res.status(404).json({
          status: 'error',
          message: 'Tag not found'
        });
      }

      res.json({
        status: 'success',
        data: tag
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  },

  // POST /tags - PROTEGIDO
  async createTag(req, res) {
    try {
      const tag = await Tag.create(req.body);
      res.status(201).json({
        status: 'success',
        data: tag
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  },

  // PUT /tags/:id - PROTEGIDO
  async updateTag(req, res) {
    try {
      const tag = await Tag.findByPk(req.params.id);
      
      if (!tag) {
        return res.status(404).json({
          status: 'error',
          message: 'Tag not found'
        });
      }

      await tag.update(req.body);
      res.json({
        status: 'success',
        data: tag
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  },

  // DELETE /tags/:id - PROTEGIDO
  async deleteTag(req, res) {
    try {
      const tag = await Tag.findByPk(req.params.id);
      
      if (!tag) {
        return res.status(404).json({
          status: 'error',
          message: 'Tag not found'
        });
      }

      await tag.destroy();
      res.json({
        status: 'success',
        data: null,
        message: 'Tag deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
};

module.exports = tagsController;