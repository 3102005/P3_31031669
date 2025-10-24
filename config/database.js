const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.NODE_ENV === 'test' ? './database_test.sqlite' : './database.sqlite',
  logging: process.env.NODE_ENV !== 'test' // Desactiva logs en tests
});

module.exports = { sequelize };