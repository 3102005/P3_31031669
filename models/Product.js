module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    stock: { type: DataTypes.INTEGER, defaultValue: 0 },
    character: { type: DataTypes.STRING },
    movie: { type: DataTypes.STRING },
    edition: { type: DataTypes.STRING },
    number: { type: DataTypes.INTEGER },
    exclusive: { type: DataTypes.BOOLEAN, defaultValue: false },
    sku: { type: DataTypes.STRING },
    slug: { type: DataTypes.STRING, unique: true }
  }, {
    tableName: 'products',
    timestamps: true
  });

  // Generar slug automático
  Product.beforeSave(async (product) => {
    if (product.name) {
      let slugBase = product.name.toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      if (product.sku) {
        const skuPart = String(product.sku).toLowerCase().replace(/[^a-z0-9-]/g, '-');
        slugBase = `${slugBase}-${skuPart}`;
      }
      product.slug = slugBase;
    }
  });

  return Product;
};