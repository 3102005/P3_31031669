const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Inicializar modelos desde sus fábricas (algunos modelos exportan fábricas)
const Category = require('./Category')(sequelize, DataTypes);
const Tag = require('./Tag')(sequelize, DataTypes);
const ProductTag = require('./ProductTag')(sequelize, DataTypes);
const Product = require('./Product')(sequelize, DataTypes);
const User = require('./User')(sequelize, DataTypes);
const Order = require('./Order')(sequelize, DataTypes);
const OrderItem = require('./OrderItem')(sequelize, DataTypes);

// Configurar asociaciones entre modelos
Product.belongsTo(Category, {
  foreignKey: 'CategoryId',
  as: 'category'
});

Category.hasMany(Product, {
  foreignKey: 'CategoryId',
  as: 'products'
});

Product.belongsToMany(Tag, {
  through: ProductTag,
  foreignKey: 'ProductId',
  otherKey: 'TagId',
  as: 'tags'
});

Tag.belongsToMany(Product, {
  through: ProductTag,
  foreignKey: 'TagId',
  otherKey: 'ProductId',
  as: 'products'
});
const db = {
  sequelize,
  Sequelize,
  DataTypes,
  User,
  Product,
  Category,
  Tag,
  ProductTag,
  Order,
  OrderItem
};

// Llamar a associate si existe en alguno de los modelos
Object.keys(db).forEach(modelName => {
  const model = db[modelName];
  if (model && model.associate) {
    model.associate(db);
  }
});

module.exports = db;