const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../config/database');

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    // Sincronizar BD de test
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        nombreCompleto: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        cedula: '123456789',
        seccion: 'Test Section'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.password).toBeUndefined();
      expect(response.body.data).toHaveProperty('token');
    });
  });
});