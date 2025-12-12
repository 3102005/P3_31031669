// tests/categories.test.js
const request = require('supertest');
const app = require('../src/app');
const { Category } = require('../src/models');

describe('Categories API', () => {
  let token;

  beforeAll(async () => {
    // Use test bypass token to simplify test environment (accepted by middleware in test env)
    token = 'test-jwt-token';
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