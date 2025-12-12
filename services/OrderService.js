const { sequelize } = require('../models');
const CreditCardPaymentStrategy = require('./payment/CreditCardPaymentStrategy');
const PaymentContext = require('./payment/PaymentContext'); // Si lo implementaste

class OrderService {
  constructor(orderRepository, productRepository) {
    this.orderRepository = orderRepository;
    this.productRepository = productRepository;
    this.paymentStrategies = {
      'CreditCard': new CreditCardPaymentStrategy()
      // Aquí podrías añadir más estrategias: 'PayPal', 'BankTransfer', etc.
    };
  }

  /**
   * Procesa una orden completa (transacción atómica)
   */
  async processOrder(userId, orderItems, paymentDetails) {
    const transaction = await sequelize.transaction();
    
    try {
      // 1. VALIDACIÓN INICIAL
      if (!orderItems || orderItems.length === 0) {
        throw new Error('La orden debe contener al menos un producto');
      }

      if (!paymentDetails || !paymentDetails.method) {
        throw new Error('Método de pago no especificado');
      }

      // 2. VERIFICAR STOCK Y OBTENER PRECIOS
      const productIds = orderItems.map(item => item.productId);
      const products = await this.productRepository.getProductsWithPrices(productIds);
      
      const productMap = new Map();
      products.forEach(product => {
        productMap.set(product.id, product);
      });

      // 3. PREPARAR ITEMS CON VALIDACIÓN
      const validatedItems = [];
      let totalAmount = 0;

      for (const item of orderItems) {
        const product = productMap.get(item.productId);
        
        if (!product) {
          throw new Error(`Producto con ID ${item.productId} no encontrado`);
        }

        // Verificar stock (con bloqueo de fila en transacción)
        await this.productRepository.checkAndReserveStock(
          product.id, 
          item.quantity, 
          transaction
        );

        const unitPrice = product.price;
        const subtotal = unitPrice * item.quantity;
        totalAmount += subtotal;

        validatedItems.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice: unitPrice,
          subtotal: subtotal
        });
      }

      // 4. PROCESAR PAGO (Patrón Strategy)
      const paymentStrategy = this.paymentStrategies[paymentDetails.method];
      if (!paymentStrategy) {
        throw new Error(`Método de pago no soportado: ${paymentDetails.method}`);
      }

      const paymentResult = await paymentStrategy.processPayment(
        paymentDetails.details, 
        totalAmount
      );

      if (!paymentResult.success) {
        throw new Error(`Pago fallido: ${paymentResult.error}`);
      }

      // 5. ACTUALIZAR STOCK (solo si pago exitoso)
      for (const item of validatedItems) {
        await this.productRepository.updateStock(
          item.productId, 
          item.quantity, 
          transaction
        );
      }

      // 6. CREAR ORDEN EN BASE DE DATOS
      const orderData = {
        userId,
        status: 'COMPLETED',
        totalAmount,
        paymentMethod: paymentDetails.method,
        transactionId: paymentResult.transactionId
      };

      const { order, orderItems: createdItems } = 
        await this.orderRepository.createOrderWithItems(
          orderData, 
          validatedItems, 
          transaction
        );

      // 7. CONFIRMAR TRANSACCIÓN
      await transaction.commit();

      return {
        success: true,
        order: {
          ...order.toJSON(),
          items: createdItems
        }
      };

    } catch (error) {
      // 8. REVERTIR TRANSACCIÓN EN CUALQUIER ERROR
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }
      
      throw error; // Re-lanzar para manejo en el controller
    }
  }

  /**
   * Obtiene historial de órdenes del usuario
   */
  async getUserOrders(userId, page = 1, limit = 10) {
    return await this.orderRepository.getUserOrders(userId, page, limit);
  }

  /**
   * Obtiene detalle de una orden específica
   */
  async getOrderDetail(orderId, userId) {
    const order = await this.orderRepository.getUserOrderById(orderId, userId);
    
    if (!order) {
      throw new Error('Orden no encontrada o no tienes permisos');
    }
    
    return order;
  }
}

module.exports = OrderService;