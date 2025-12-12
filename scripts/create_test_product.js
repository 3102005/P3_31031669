(async ()=>{
  try {
    process.env.NODE_ENV = process.env.NODE_ENV || 'test';
    const db = require('../models');
    await db.sequelize.sync({ force: true });
    console.log('DB sync force completed');
    const { Category, Product } = db;
    const cat = await Category.create({ name: 'TestCat', description: 'cat for testing' });
    const p = await Product.create({ name: 'TestProduct', slug: 'test-product', price: 100.00, stock: 5, CategoryId: cat.id });
    console.log('CREATED_PRODUCT_ID=' + p.id);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
