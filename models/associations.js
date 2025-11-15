const Category = require('./Category');
const Product = require('./Product');
const Tag = require('./Tag');
const ProductTag = require('./ProductTag');

// Un Product pertenece a una Category
Product.belongsTo(Category, {
  foreignKey: 'CategoryId',
  as: 'category'
});

// Una Category tiene muchos Products
Category.hasMany(Product, {
  foreignKey: 'CategoryId',
  as: 'products'
});

// Un Product puede tener muchos Tags (y viceversa)
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

module.exports = { Category, Product, Tag, ProductTag };