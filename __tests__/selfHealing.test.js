const request = require('supertest');
const app = require('../app');
const { Product } = require('../models');
const { sequelize } = require('../models/index');

describe('Self-Healing URL', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should redirect to correct slug when slug is wrong', async () => {
    // Crear producto de prueba
    const product = await Product.create({
      name: 'Iron Man Funko Pop',
      price: 29.99,
      stock: 1,
      sku: 'SH001',
      movie: 'Avengers: Endgame',
      character: 'Iron Man'
    });

    await request(app)
      .get(`/p/${product.id}-wrong-slug`)
      .expect(301)
      .expect('Location', `/p/${product.id}-${product.slug}`);
  });

  it('should return product when slug is correct', async () => {
    const product = await Product.create({
      name: 'Captain America Funko Pop',
      price: 29.99,
      stock: 1,
      sku: 'SH002',
      movie: 'Avengers: Endgame',
      character: 'Captain America'
    });

    await request(app)
      .get(`/p/${product.id}-${product.slug}`)
      .expect(200);
  });
});