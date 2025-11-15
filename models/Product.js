const { sequelize, DataTypes } = require('./index');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  sku: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  brand: {
    type: DataTypes.STRING,
    defaultValue: 'Funko'
  },
  publisher: {
    type: DataTypes.STRING,
    defaultValue: 'Marvel'
  },
  movie: {
    type: DataTypes.STRING,
    allowNull: false
  },
  character: {
    type: DataTypes.STRING,
    allowNull: false
  },
  edition: {
    type: DataTypes.STRING,
    defaultValue: 'Standard'
  },
  releaseYear: {
    type: DataTypes.INTEGER
  },
  isExclusive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  slug: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  }
}, {
  tableName: 'products',
  timestamps: true
});

module.exports = Product;