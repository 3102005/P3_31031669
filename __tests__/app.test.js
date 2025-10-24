const request = require('supertest');
const app = require('../app');

describe('API Endpoints', () => {
  describe('GET /ping', () => {
    it('should return 200 OK with empty body', async () => {
      const response = await request(app)
        .get('/ping')
        .expect(200);
      
      expect(response.text).toBe('');
    });
  });

  describe('GET /about', () => {
    it('should return 200 OK with JSend format', async () => {
      const response = await request(app)
        .get('/about')
        .expect(200)
        .expect('Content-Type', /json/);
      
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('nombreCompleto');
      expect(response.body.data).toHaveProperty('cedula');
      expect(response.body.data).toHaveProperty('seccion');
    });

    it('should contain correct data structure', async () => {
      const response = await request(app).get('/about');
      
      const { data } = response.body;
      expect(typeof data.nombreCompleto).toBe('string');
      expect(typeof data.cedula).toBe('string');
      expect(typeof data.seccion).toBe('string');
    });
  });
});