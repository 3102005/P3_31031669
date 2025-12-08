const User = require('../models/User');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'nombreCompleto', 'email', 'cedula', 'seccion', 'createdAt', 'updatedAt']
    });
    
    res.status(200).json({
      status: 'success',
      data: users
    });
  } catch (error) {
    console.error('userController.getAllUsers error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'nombreCompleto', 'email', 'cedula', 'seccion', 'createdAt', 'updatedAt']
    });

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

const createUser = async (req, res) => {
  try {
       const { nombreCompleto, email, password, cedula, seccion } = req.body;

      if (!nombreCompleto || !email || !password || !cedula) {
        return res.status(400).json({
          status: 'fail',
          message: 'nombreCompleto, email, password y cedula son obligatorios'
        });
      }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        status: 'fail',
        message: 'User already exists with this email'
      });
    }
    const payload = { nombreCompleto, email, password, cedula };
    if (seccion) payload.seccion = seccion;
    const user = await User.create(payload);

    res.status(201).json({
      status: 'success',
      data: {
        id: user.id,
        nombreCompleto: user.nombreCompleto,
        email: user.email
      }
    });
  } catch (error) {
    console.error('userController.createUser error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

const updateUser = async (req, res) => {
  try {
  const { nombreCompleto, email, cedula, seccion } = req.body;
  const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({
          status: 'fail',
          message: 'Email already in use'
        });
      }
    }

  const updatePayload = { nombreCompleto, email, cedula };
  if (seccion !== undefined) updatePayload.seccion = seccion;
  await user.update(updatePayload);

    res.status(200).json({
      status: 'success',
      data: {
        id: user.id,
        nombreCompleto: user.nombreCompleto,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    await user.destroy();

    res.status(200).json({
      status: 'success',
      data: null,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};