const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

// Inicializar modelos desde sus fábricas
const Category = require('./Category')(sequelize, DataTypes);
const Tag = require('./Tag')(sequelize, DataTypes);
const ProductTag = require('./ProductTag')(sequelize, DataTypes);
const Product = require('./Product')(sequelize, DataTypes);

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
module.exports = {
  sequelize,
  Sequelize,
  DataTypes,
  Category,
  Tag,
  Product,
  ProductTag
};