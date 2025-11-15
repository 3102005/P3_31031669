// tests/categories.test.js
const request = require('supertest');
const app = require('../src/app');
const { Category } = require('../src/models');

describe('Categories API', () => {
  let token;

  beforeAll(async () => {
    // Login para obtener token
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'password' });
    token = res.body.data.token;
  });

  describe('GET /categories', () => {
    it('should return 401 without token', async () => {
      await request(app)
        .get('/categories')
        .expect(401);
    });

    it('should return categories with valid token', async () => {
      await request(app)
        .get('/categories')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /json/);
    });
  });

  // Más pruebas para POST, PUT, DELETE...
});