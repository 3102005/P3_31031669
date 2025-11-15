const models = require('../models');
console.log('models keys:', Object.keys(models));
const { Product, Category } = models;
console.log('Product type:', typeof Product);
console.log('Product keys:', Object.keys(Product || {}));
console.log('Product.belongsTo exists:', Product && typeof Product.belongsTo);
console.log('Category type:', typeof Category);
console.log('Category.keys:', Object.keys(Category || {}));
