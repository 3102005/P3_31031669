module.exports = (sequelize, DataTypes) => {
  return sequelize.define('ProductTag', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ProductId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    TagId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'tags',
        key: 'id'
      }
    }
  }, {
    tableName: 'product_tags',
    timestamps: false
  });
};