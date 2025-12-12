const { User } = require('../models');

class UserService {
  async getAllUsers() {
    return await User.findAll();
  }

  async getUserById(id) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    return user;
  }

  async createUser(userData) {
    // Verificar si email ya existe
    const existingUser = await User.findOne({ where: { email: userData.email } });
    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // Verificar si cédula ya existe
    const existingCedula = await User.findOne({ where: { cedula: userData.cedula } });
    if (existingCedula) {
      throw new Error('La cédula ya está registrada');
    }

    return await User.create(userData);
  }

  async updateUser(id, userData) {
    const user = await this.getUserById(id);
    
    // Si se está actualizando el email, verificar que no exista
    if (userData.email && userData.email !== user.email) {
      const existingUser = await User.findOne({ where: { email: userData.email } });
      if (existingUser) {
        throw new Error('El email ya está registrado');
      }
    }

    return await user.update(userData);
  }

  async deleteUser(id) {
    const user = await this.getUserById(id);
    await user.destroy();
    return { message: 'Usuario eliminado correctamente' };
  }
}

module.exports = new UserService();