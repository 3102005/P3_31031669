module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'COMPLETED', 'CANCELED', 'PAYMENT_FAILED'),
      defaultValue: 'PENDING'
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false
    },
    transactionId: {
      type: DataTypes.STRING  // Para guardar ID de la transacción externa
    }
  }, {
    tableName: 'orders',
    timestamps: true
  });

  Order.associate = (models) => {
    Order.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Order.hasMany(models.OrderItem, { 
      foreignKey: 'orderId', 
      as: 'items',
      onDelete: 'CASCADE'
    });
  };

  return Order;
};