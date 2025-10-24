const UserService = require('../services/userService');

const userController = {
  async getAllUsers(req, res) {
    try {
      const users = await UserService.getAllUsers();
      res.json({
        status: 'success',
        data: users
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Error obteniendo usuarios'
      });
    }
  },

  async getUserById(req, res) {
    try {
      const user = await UserService.getUserById(req.params.id);
      res.json({
        status: 'success',
        data: user
      });
    } catch (error) {
      res.status(404).json({
        status: 'fail',
        message: error.message
      });
    }
  },

  async createUser(req, res) {
    try {
      const user = await UserService.createUser(req.body);
      res.status(201).json({
        status: 'success',
        data: user
      });
    } catch (error) {
      res.status(400).json({
        status: 'fail',
        message: error.message
      });
    }
  },

  async updateUser(req, res) {
    try {
      const user = await UserService.updateUser(req.params.id, req.body);
      res.json({
        status: 'success',
        data: user
      });
    } catch (error) {
      const statusCode = error.message.includes('no encontrado') ? 404 : 400;
      res.status(statusCode).json({
        status: 'fail',
        message: error.message
      });
    }
  },

  async deleteUser(req, res) {
    try {
      const result = await UserService.deleteUser(req.params.id);
      res.json({
        status: 'success',
        data: result
      });
    } catch (error) {
      res.status(404).json({
        status: 'fail',
        message: error.message
      });
    }
  }
};

module.exports = userController;