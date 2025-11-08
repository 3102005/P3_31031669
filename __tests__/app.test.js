const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../config/database');

describe('Basic Endpoints', () => {
  beforeAll(async () => {
    // Esperar a que la BD se inicialice
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /ping', () => {
    it('should return 200', async () => {
      const response = await request(app).get('/ping');
      expect(response.status).toBe(200);
    });
  });

  describe('GET /about', () => {
    it('should return developer info', async () => {
      const response = await request(app).get('/about');
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('nombreCompleto');
      expect(response.body.data).toHaveProperty('cedula');
      expect(response.body.data).toHaveProperty('seccion');
    });
  });

  describe('GET /nonexistent', () => {
    it('should return 404 for unknown endpoints', async () => {
      const response = await request(app).get('/nonexistent');
      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
    });
  });
});