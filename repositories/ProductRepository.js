// repositories/ProductRepository.js - NUEVO ARCHIVO (nueva carpeta)
const { Product, Category, Tag } = require('../models');

class ProductRepository {
  constructor() {
    this.model = Product;
  }

  async findAllWithFilters(queryOptions = {}) {
    return await this.model.findAndCountAll(queryOptions);
  }

  async findById(id) {
    return await this.model.findByPk(id, {
      include: [
        { model: Category, as: 'category' },
        { model: Tag, as: 'tags', through: { attributes: [] } }
      ]
    });
  }

  async create(productData) {
    // Create product first, then associate tags if provided to avoid
    // eager-loading alias issues.
    const { tags, CategoryId, ...rest } = productData;
    const product = await this.model.create({ ...rest, CategoryId });

    if (tags && Array.isArray(tags) && tags.length > 0) {
      // tags might be array of ids
      await product.setTags(tags);
    }

    return await this.findById(product.id);
  }

  async update(id, productData) {
    const product = await this.findById(id);
    if (!product) return null;
    const { tags, CategoryId, ...rest } = productData;
    await product.update({ ...rest, CategoryId });
    if (tags && Array.isArray(tags)) {
      await product.setTags(tags);
    }
    return await this.findById(id);
  }

  async delete(id) {
    const product = await this.findById(id);
    if (!product) return null;
    
    await product.destroy();
    return true;
  }

  async checkAndReserveStock(productId, quantity, transaction = null) {
    const product = await this.model.findByPk(productId, {
      transaction,
      lock: transaction ? true : false // Bloquea la fila en transacción
    });

    if (!product) {
      throw new Error(`Producto con ID ${productId} no encontrado`);
    }

    if (product.stock < quantity) {
      throw new Error(`Stock insuficiente para ${product.name}. Disponible: ${product.stock}, Solicitado: ${quantity}`);
    }

    return product;
  }

  /**
   * Actualiza stock (disminuir)
   */
  async updateStock(productId, quantityToDecrease, transaction = null) {
    const product = await this.model.findByPk(productId, { transaction });
    
    if (!product) {
      throw new Error(`Producto no encontrado: ${productId}`);
    }

    product.stock -= quantityToDecrease;
    
    if (product.stock < 0) {
      throw new Error(`Stock no puede ser negativo para ${product.name}`);
    }

    await product.save({ transaction });
    return product;
  }

  /**
   * Obtiene precios actuales de productos
   */
  async getProductsWithPrices(productIds) {
    return await this.model.findAll({
      where: { id: productIds },
      attributes: ['id', 'name', 'price', 'stock']
    });
  }
}

module.exports = ProductRepository;