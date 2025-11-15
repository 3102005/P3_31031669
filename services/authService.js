const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthService {
  generateToken(userId) {
    return jwt.sign(
      { userId }, 
      process.env.JWT_SECRET || 'avengers-funko-secret-key',
      { expiresIn: '24h' }
    );
  }

  verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_para_desarrollo');
  }

  async register(userData) {
    const UserService = require('./userService');
    const user = await UserService.createUser(userData);
    
    const token = this.generateToken(user.id);
    return {
      status: 'success',
      data: {
        user: user.toJSON(),
        token
      }
    };
  }

  async login(email, password) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      throw new Error('Credenciales inválidas');
    }

    const token = this.generateToken(user.id);
    
    return {
      status: 'success',
      data: {
        user: user.toJSON(),
        token
      }
    };
  }
}

module.exports = new AuthService();