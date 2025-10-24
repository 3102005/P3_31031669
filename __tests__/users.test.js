const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../config/database');
const AuthService = require('../services/authService');

describe('Users Endpoints', () => {
  let authToken;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    
    // Crear usuario de prueba y obtener token
    const UserService = require('../services/userService');
    const user = await UserService.createUser({
      nombreCompleto: 'Admin User',
      email: 'admin@test.com',
      password: 'admin123',
      cedula: '111111111',
      seccion: 'Admin'
    });
    
    authToken = AuthService.generateToken(user.id);
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /users', () => {
    it('should return 401 without token', async () => {
      await request(app)
        .get('/users')
        .expect(401);
    });

    it('should return users with valid token', async () => {
      const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /users', () => {
    it('should create user with valid token', async () => {
      const newUser = {
        nombreCompleto: 'New User',
        email: 'new@example.com',
        password: 'newpassword123',
        cedula: '222222222',
        seccion: 'Users'
      };

      const response = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newUser)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.email).toBe(newUser.email);
    });
  });
});