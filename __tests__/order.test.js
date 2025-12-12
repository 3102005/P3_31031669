const request = require('supertest');
const app = require('../app'); // Ajusta según tu estructura
const { sequelize, User, Product, Order } = require('../models');
const jwt = require('jsonwebtoken');

describe('Order API', () => {
  let authToken;
  let userId;
  let testProduct1, testProduct2;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    
    // Crear usuario de prueba
    const user = await User.create({
      fullName: 'Test User',
      email: 'test@order.com',
      password: 'password123'
    });
    userId = user.id;
    
    // Crear productos de prueba
    testProduct1 = await Product.create({
      name: 'Product 1',
      slug: 'product-1',
      price: 100.00,
      stock: 10,
      categoryId: 1
    });
    
    testProduct2 = await Product.create({
      name: 'Product 2',
      slug: 'product-2',
      price: 50.00,
      stock: 5,
      categoryId: 1
    });
    
    // Generar token JWT
    authToken = jwt.sign(
      { id: userId, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/orders', () => {
    test('Debería crear una orden exitosa con pago simulado', async () => {
      // Mock de la API de pagos
      const mockPayment = jest.fn().mockResolvedValue({
        success: true,
        transactionId: 'txn_123456'
      });
      
      // Aquí inyectarías el mock en tu PaymentStrategy
      // Necesitarás modificar tu código para permitir inyección de dependencias
      
      const orderData = {
        items: [
          { productId: testProduct1.id, quantity: 2 },
          { productId: testProduct2.id, quantity: 1 }
        ],
        paymentMethod: 'CreditCard',
        paymentDetails: {
          cardToken: 'tok_test_123',
          currency: 'USD'
        }
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.order).toHaveProperty('id');
      expect(response.body.data.order.totalAmount).toBe(250.00); // (100*2 + 50*1)
      expect(response.body.data.order.status).toBe('COMPLETED');
    });

    test('Debería fallar por stock insuficiente', async () => {
      const orderData = {
        items: [
          { productId: testProduct1.id, quantity: 100 } // Más del stock disponible
        ],
        paymentMethod: 'CreditCard',
        paymentDetails: {
          cardToken: 'tok_test_123',
          currency: 'USD'
        }
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData);

      expect(response.status).toBe(409); // Conflict
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Stock insuficiente');
    });

    test('Debería fallar sin token de autenticación', async () => {
      const orderData = {
        items: [{ productId: 1, quantity: 1 }],
        paymentMethod: 'CreditCard',
        paymentDetails: { cardToken: 'tok_test' }
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/orders', () => {
    test('Debería retornar historial de órdenes del usuario', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('orders');
      expect(response.body.data).toHaveProperty('pagination');
    });

    test('GET /api/orders/:id debería retornar detalle de orden', async () => {
      // Primero crear una orden
      const order = await Order.create({
        userId,
        status: 'COMPLETED',
        totalAmount: 100.00,
        paymentMethod: 'CreditCard'
      });

      const response = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.order.id).toBe(order.id);
    });
  });
});