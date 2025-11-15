// src/services/ProductQueryBuilder.js
const { Op } = require('sequelize');
const { Category, Tag } = require('../models');

class ProductQueryBuilder {
  constructor() {
    this.queryOptions = {
      where: {},
      include: [],
      limit: 10,
      offset: 0
    };
  }

  withPagination(page = 1, limit = 10) {
    this.queryOptions.limit = parseInt(limit);
    this.queryOptions.offset = (page - 1) * limit;
    return this;
  }

  withCategory(categoryId) {
    if (categoryId) {
      this.queryOptions.include.push({
        model: Category,
        as: 'category',
        where: { id: categoryId },
        required: true
      });
    }
    return this;
  }

  withTags(tagIds) {
    if (tagIds && tagIds.length > 0) {
      this.queryOptions.include.push({
        model: Tag,
        as: 'tags',
        where: { id: { [Op.in]: tagIds } },
        through: { attributes: [] },
        required: true
      });
    }
    return this;
  }

  withPriceRange(minPrice, maxPrice) {
    if (minPrice || maxPrice) {
      this.queryOptions.where.price = {};
      if (minPrice) this.queryOptions.where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) this.queryOptions.where.price[Op.lte] = parseFloat(maxPrice);
    }
    return this;
  }

  withSearch(searchTerm) {
    if (searchTerm) {
      this.queryOptions.where[Op.or] = [
        { name: { [Op.iLike]: `%${searchTerm}%` } },
        { description: { [Op.iLike]: `%${searchTerm}%` } }
      ];
    }
    return this;
  }

  // Filtros personalizados para Funko Pop Avengers
  withCharacter(character) {
    if (character) {
      this.queryOptions.where.character = character;
    }
    return this;
  }

  withMovie(movie) {
    if (movie) {
      this.queryOptions.where.movie = { [Op.like]: `%${movie}%` };
    }
    return this;
  }

  withEdition(edition) {
    if (edition) {
      this.queryOptions.where.edition = edition;
    }
    return this;
  }

  withExclusive(exclusive) {
    if (exclusive !== undefined) {
      this.queryOptions.where.exclusive = exclusive === 'true';
    }
    return this;
  }

  build() {
    // Asegurar que las inclusiones básicas estén presentes
    if (!this.queryOptions.include.some(inc => inc.model === Category || inc === Category)) {
      this.queryOptions.include.push({ model: Category, as: 'category' });
    }
    if (!this.queryOptions.include.some(inc => inc.model === Tag || inc === Tag)) {
      this.queryOptions.include.push({ model: Tag, as: 'tags' });
    }

    return this.queryOptions;
  }
}

module.exports = ProductQueryBuilder;