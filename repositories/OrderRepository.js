const BaseRepository = require('./BaseRepository'); // Si tienes una clase base

class OrderRepository extends BaseRepository {
  constructor(model) {
    super(model);
  }

  /**
   * Crea una orden con sus items (en transacción)
   */
  async createOrderWithItems(orderData, itemsData, transaction = null) {
    // Calcular totalAmount si no viene
    if (!orderData.totalAmount) {
      orderData.totalAmount = itemsData.reduce((sum, item) => {
        return sum + (item.unitPrice * item.quantity);
      }, 0);
    }

    // Crear la orden
    const order = await this.model.create(orderData, { transaction });

    // Crear los items de la orden
    const orderItems = [];
    for (const itemData of itemsData) {
      itemData.orderId = order.id;
      const orderItem = await this.models.OrderItem.create(itemData, { transaction });
      orderItems.push(orderItem);
    }

    return { order, orderItems };
  }

  /**
   * Obtiene órdenes de un usuario con paginación
   */
  async getUserOrders(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const { count, rows } = await this.model.findAndCountAll({
      where: { userId },
      include: [
        {
          model: this.models.OrderItem,
          as: 'items',
          include: [
            {
              model: this.models.Product,
              as: 'product',
              attributes: ['id', 'name', 'slug']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      distinct: true // Importante para count correcto con includes
    });

    return {
      orders: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems: count,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Obtiene una orden específica de un usuario
   */
  async getUserOrderById(orderId, userId) {
    return await this.model.findOne({
      where: { 
        id: orderId,
        userId 
      },
      include: [
        {
          model: this.models.OrderItem,
          as: 'items',
          include: [
            {
              model: this.models.Product,
              as: 'product',
              attributes: ['id', 'name', 'slug', 'price']
            }
          ]
        },
        {
          model: this.models.User,
          as: 'user',
          attributes: ['id', 'fullName', 'email']
        }
      ]
    });
  }
}

module.exports = OrderRepository;