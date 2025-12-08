const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.NODE_ENV === 'test' ? './test.sqlite' : './database.sqlite',
  logging: false
});

// Sincronizar base de datos
const syncDatabase = async () => {
  try {
    await sequelize.sync();
    if (process.env.NODE_ENV !== 'test') {
      console.log('Database synchronized successfully');
    }
  } catch (error) {
    console.error('Database sync error:', error);
  }
};

module.exports = { sequelize, syncDatabase };