// repositories/ProductRepository.js - NUEVO ARCHIVO (nueva carpeta)
const { Product, Category, Tag } = require('../models');

class ProductRepository {
  constructor() {
    this.model = Product;
  }

  async findAllWithFilters(queryOptions = {}) {
    // Clean empty where/include conditions that may produce invalid SQL
    const opts = Object.assign({}, queryOptions || {});
    if (queryOptions.where) {
      opts.where = Object.assign({}, queryOptions.where);
      Object.keys(opts.where).forEach(k => {
        const v = opts.where[k];
        if (v && typeof v === 'object') {
          const hasStringKeys = Object.keys(v).length > 0;
          const hasSymbolKeys = Object.getOwnPropertySymbols(v).length > 0;
          if (!hasStringKeys && !hasSymbolKeys) delete opts.where[k];
        }
      });
      if (Object.keys(opts.where).length === 0) delete opts.where;
    }
    if (queryOptions.include && Array.isArray(queryOptions.include)) {
      // keep original include objects (they contain Model references)
      opts.include = queryOptions.include.map(inc => {
        if (inc && inc.where && typeof inc.where === 'object') {
          const hasStringKeys = Object.keys(inc.where).length > 0;
          const hasSymbolKeys = Object.getOwnPropertySymbols(inc.where).length > 0;
          if (!hasStringKeys && !hasSymbolKeys) {
            const copy = Object.assign({}, inc);
            delete copy.where;
            delete copy.required;
            return copy;
          }
        }
        return inc;
      });
    }
    return await this.model.findAndCountAll(opts);
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