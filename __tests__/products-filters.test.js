const request = require('supertest');
const app = require('../app');

describe('Product Filters', () => {
  describe('GET /products with filters', () => {
    it('should filter by movie', async () => {
      const response = await request(app)
        .get('/products')
        .query({ movie: 'Endgame' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      // Todos los productos deben ser de la película Endgame
      response.body.data.products.forEach(product => {
        expect(product.movie).toMatch(/Endgame/i);
      });
    });

    it('should filter by character', async () => {
      const response = await request(app)
        .get('/products')
        .query({ character: 'Iron Man' });

      expect(response.status).toBe(200);
      response.body.data.products.forEach(product => {
        expect(product.character).toMatch(/Iron Man/i);
      });
    });

    it('should filter by edition', async () => {
      const response = await request(app)
        .get('/products')
        .query({ edition: 'Exclusive' });

      expect(response.status).toBe(200);
      response.body.data.products.forEach(product => {
        expect(product.edition).toBe('Exclusive');
      });
    });

    it('should filter by price range', async () => {
      const response = await request(app)
        .get('/products')
        .query({ price_min: 20, price_max: 30 });

      expect(response.status).toBe(200);
      response.body.data.products.forEach(product => {
        expect(parseFloat(product.price)).toBeGreaterThanOrEqual(20);
        expect(parseFloat(product.price)).toBeLessThanOrEqual(30);
      });
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/products')
        .query({ page: 1, limit: 2 });

      expect(response.status).toBe(200);
      expect(response.body.data.products.length).toBeLessThanOrEqual(2);
      expect(response.body.data.pagination).toHaveProperty('page', 1);
      expect(response.body.data.pagination).toHaveProperty('limit', 2);
    });
  });
});