const { sequelize, DataTypes } = require('./index');
const { Op } = require('sequelize');

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
  sku: { type: DataTypes.STRING, unique: true, allowNull: false },
  brand: { type: DataTypes.STRING, defaultValue: 'Funko' },
  publisher: { type: DataTypes.STRING, defaultValue: 'Marvel' },
  movie: { type: DataTypes.STRING, allowNull: false },
  character: { type: DataTypes.STRING, allowNull: false },
  edition: { type: DataTypes.STRING, defaultValue: 'Standard' },
  releaseYear: { type: DataTypes.INTEGER },
  isExclusive: { type: DataTypes.BOOLEAN, defaultValue: false },
  slug: { type: DataTypes.STRING, unique: true, allowNull: false }
}, {
  tableName: 'products',
  timestamps: true,
  hooks: {
    beforeValidate: async (product) => {
      if (product.name && product.sku && !product.slug) {
        const generateSlug = (name, sku, counter = 0) => {
          let slug = `${name.toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')}-${sku.toLowerCase()}`;

          if (counter > 0) {
            slug = `${slug}-${counter}`;
          }

          return slug;
        };

        let slug = generateSlug(product.name, product.sku);
        let counter = 1;

        while (await Product.findOne({ 
          where: { 
            slug,
            ...(product.id && { id: { [Op.ne]: product.id } })
          } 
        })) {
          slug = generateSlug(product.name, product.sku, counter);
          counter++;
        }

        product.slug = slug;
      }
    },
    beforeUpdate: async (product) => {
      if (product.changed && (product.changed('name') || product.changed('sku'))) {
        const generateSlug = (name, sku, counter = 0) => {
          let slug = `${name.toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')}-${sku.toLowerCase()}`;

          if (counter > 0) {
            slug = `${slug}-${counter}`;
          }

          return slug;
        };

        let slug = generateSlug(product.name, product.sku);
        let counter = 1;

        while (await Product.findOne({ 
          where: { 
            slug,
            id: { [Op.ne]: product.id }
          } 
        })) {
          slug = generateSlug(product.name, product.sku, counter);
          counter++;
        }

        product.slug = slug;
      }
    }
  }
});

module.exports = Product;