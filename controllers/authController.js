const AuthService = require('../services/authService');

const authController = {
  async register(req, res) {
    try {
      const { nombreCompleto, email, password, cedula, seccion } = req.body;

      // Validación básica
      if (!nombreCompleto || !email || !password || !cedula || !seccion) {
        return res.status(400).json({
          status: 'fail',
          message: 'Todos los campos son requeridos'
        });
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Formato de email inválido'
        });
      }

      const result = await AuthService.register({
        nombreCompleto,
        email,
        password,
        cedula,
        seccion
      });

      res.status(201).json(result);
    } catch (error) {
      console.error('Error en register:', error);
      res.status(400).json({
        status: 'fail',
        message: error.message
      });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          status: 'fail',
          message: 'Email y password son requeridos'
        });
      }

      const result = await AuthService.login(email, password);
      res.json(result);
    } catch (error) {
      console.error('Error en login:', error);
      res.status(401).json({
        status: 'fail',
        message: error.message
      });
    }
  }
};

module.exports = authController;