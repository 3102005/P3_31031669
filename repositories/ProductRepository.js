// src/repositories/ProductRepository.js
const { Product, Category, Tag } = require('../models');

class ProductRepository {
  constructor() {
    this.model = Product;
  }

  async findAllWithFilters(filters = {}) {
    const { page = 1, limit = 10, ...whereConditions } = filters;
    const offset = (page - 1) * limit;

    return await this.model.findAndCountAll({
      where: whereConditions,
      include: [
        { model: Category, as: 'category' },
        { model: Tag, as: 'tags' }
      ],
      limit: parseInt(limit),
      offset: offset,
      distinct: true
    });
  }

  async findById(id) {
    return await this.model.findByPk(id, {
      include: [
        { model: Category, as: 'category' },
        { model: Tag, as: 'tags' }
      ]
    });
  }

  async findBySlug(slug) {
    return await this.model.findOne({
      where: { slug },
      include: [
        { model: Category, as: 'category' },
        { model: Tag, as: 'tags' }
      ]
    });
  }

  async create(productData) {
    // If tags are provided as array of tag IDs, create product then associate
    const tags = productData.tags;
    if (tags) delete productData.tags;

    const product = await this.model.create(productData);
    if (tags && Array.isArray(tags) && tags.length > 0) {
      await product.setTags(tags);
    }
    return product;
  }

  async update(id, productData) {
    const product = await this.findById(id);
    if (!product) return null;
    const tags = productData.tags;
    if (tags) delete productData.tags;

    const updated = await product.update(productData);
    if (tags && Array.isArray(tags)) {
      await updated.setTags(tags);
    }
    return updated;
  }

  async delete(id) {
    const product = await this.findById(id);
    if (!product) return null;
    
    await product.destroy();
    return true;
  }
}

module.exports = ProductRepository;