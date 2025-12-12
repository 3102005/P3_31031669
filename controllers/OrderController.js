const OrderService = require('../services/OrderService');

class OrderController {
  constructor(orderService) {
    this.orderService = orderService;
  }

  /**
   * POST /orders - Crear nueva orden
   */
  createOrder = async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ status: 'error', message: 'Access token required' });
      }
      const userId = req.user.id; // Del middleware auth
      const { items, paymentMethod, paymentDetails } = req.body;

      if (!items || !Array.isArray(items)) {
        return res.status(400).json({
          status: 'fail',
          message: 'El campo "items" debe ser un array'
        });
      }

      const result = await this.orderService.processOrder(userId, items, {
        method: paymentMethod,
        details: paymentDetails
      });

      res.status(201).json({
        status: 'success',
        data: { order: result.order }
      });

    } catch (error) {
      // Manejo específico de errores
      let statusCode = 500;
      let errorMessage = error.message;

      if (error.message.includes('Stock insuficiente')) {
        statusCode = 409; // Conflict
      } else if (error.message.includes('Pago fallido')) {
        statusCode = 402; // Payment Required
      } else if (error.message.includes('no encontrado')) {
        statusCode = 404;
      } else if (error.message.includes('Método de pago')) {
        statusCode = 400;
      }

      res.status(statusCode).json({
        status: 'fail',
        message: errorMessage
      });
    }
  };

  /**
   * GET /orders - Historial de órdenes
   */
  getOrders = async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ status: 'error', message: 'Access token required' });
      }
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await this.orderService.getUserOrders(userId, page, limit);

      res.status(200).json({
        status: 'success',
        data: {
          orders: result.orders,
          pagination: result.pagination
        }
      });

    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Error al obtener las órdenes'
      });
    }
  };

  /**
   * GET /orders/:id - Detalle de orden
   */
  getOrderById = async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ status: 'error', message: 'Access token required' });
      }
      const userId = req.user.id;
      const orderId = req.params.id;

      const order = await this.orderService.getOrderDetail(orderId, userId);

      res.status(200).json({
        status: 'success',
        data: { order }
      });

    } catch (error) {
      if (error.message.includes('no encontrada')) {
        return res.status(404).json({
          status: 'fail',
          message: error.message
        });
      }
      
      res.status(500).json({
        status: 'error',
        message: 'Error al obtener la orden'
      });
    }
  };
}

module.exports = OrderController;