const { Product, Category, Tag } = require('../models/associations');
const { Op } = require('sequelize');
const ProductQueryBuilder = require('../services/QueryBuilder');

class ProductRepository {
  async findAll(filters = {}) {
    const {
      page = 1,
      limit = 10,
      category,
      tags,
      price_min,
      price_max,
      search,
      movie,
      character,
      edition
    } = filters;

    const queryBuilder = new ProductQueryBuilder()
      .paginate(page, limit)
      .filterByCategory(category)
      .filterByTags(tags)
      .filterByPrice(price_min, price_max)
      .search(search)
      .filterByMovie(movie)
      .filterByCharacter(character)
      .filterByEdition(edition);

    const query = queryBuilder.build();
    
    return await Product.findAndCountAll(query);
  }

  async findById(id) {
    return await Product.findByPk(id, {
      include: [
        { model: Category, as: 'category' },
        { model: Tag, as: 'tags', through: { attributes: [] } }
      ]
    });
  }

  async findBySlug(slug) {
    return await Product.findOne({
      where: { slug },
      include: [
        { model: Category, as: 'category' },
        { model: Tag, as: 'tags', through: { attributes: [] } }
      ]
    });
  }

  async create(productData) {
    return await Product.create(productData);
  }

  async update(id, productData) {
    const product = await this.findById(id);
    if (!product) return null;
    
    return await product.update(productData);
  }

  async delete(id) {
    const product = await this.findById(id);
    if (!product) return null;
    
    await product.destroy();
    return product;
  }

  async generateSlug(name, sku, existingId = null) {
    const baseSlug = `${name.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')}-${sku.toLowerCase()}`;
    
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const where = { slug };
      if (existingId) where.id = { [Op.ne]: existingId };

      const existing = await Product.findOne({ where });

      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }
}

module.exports = ProductRepository;