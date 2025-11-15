const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../models/index');

describe('Product Slug Generation', () => {
  let token = 'test-jwt-token';
  let productId;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Crear una categoría mínima necesaria
    const catRes = await request(app)
      .post('/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Avengers', description: 'Avengers collection' });

    const tagRes = await request(app)
      .post('/tags')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'limited-edition' });

    // Crear un producto base para poder probar actualización
    const productData = {
      name: 'Test Product Avengers',
      description: 'Test description',
      price: 25.99,
      stock: 10,
      sku: 'BASE123',
      movie: 'Avengers: Endgame',
      character: 'Test Character',
      CategoryId: catRes.body.data.id,
      tags: tagRes.body.data ? [tagRes.body.data.id] : undefined
    };

    const createRes = await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${token}`)
      .send(productData);

    productId = createRes.body.data ? createRes.body.data.id : null;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should generate slug automatically on create', async () => {
    const productData = {
      name: 'Test Product Avengers',
      description: 'Test description',
      price: 25.99,
      stock: 10,
      sku: 'TEST123',
      movie: 'Avengers: Endgame',
      character: 'Test Character',
      CategoryId: 1
    };

    const response = await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${token}`)
      .send(productData);

    expect(response.status).toBe(201);
    expect(response.body.data.slug).toBe('test-product-avengers-test123');
    // No debería enviarse slug en el request
    expect(productData.slug).toBeUndefined();
  });

  it('should regenerate slug on name update', async () => {
    const updateData = {
      name: 'Updated Product Name',
      sku: 'UPDATED123'
    };

    const response = await request(app)
      .put(`/products/${productId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.data.slug).toBe('updated-product-name-updated123');
  });
});