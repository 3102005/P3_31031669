const request = require('supertest');
const app = require('../app');

// Tests mínimos que siempre funcionan
describe('Minimal Health Checks', () => {
  test('Server should start without errors', () => {
    expect(app).toBeDefined();
  });

  test('GET /ping should return 200', async () => {
    const response = await request(app).get('/ping');
    expect(response.status).toBe(200);
  });

  test('GET /about should return valid structure', async () => {
    const response = await request(app).get('/about');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
  });
});