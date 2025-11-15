// services/ProductQueryBuilder.js - NUEVO ARCHIVO (nueva carpeta)
const { Op } = require('sequelize');
const { Category, Tag } = require('../models');

class ProductQueryBuilder {
  constructor() {
    this.queryOptions = {
      where: {},
      include: [
        { model: Category, as: 'category' },
        { model: Tag, as: 'tags', through: { attributes: [] } }
      ]
    };
  }

  withPagination(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    this.queryOptions.limit = parseInt(limit);
    this.queryOptions.offset = offset;
    return this;
  }

  withCategory(category) {
    if (category) {
      this.queryOptions.include[0].where = {
        [Op.or]: [
          { id: category },
          { name: { [Op.like]: `%${category}%` } }
        ]
      };
      this.queryOptions.include[0].required = true;
    }
    return this;
  }

  withTags(tags) {
    if (tags) {
      const tagIds = tags.split(',').map(id => parseInt(id.trim()));
      this.queryOptions.include[1].where = { id: { [Op.in]: tagIds } };
      this.queryOptions.include[1].required = true;
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

  withSearch(search) {
    if (search) {
      this.queryOptions.where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
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

  // Filtros específicos para Funko Pop Avengers
  withCharacter(character) {
    if (character) {
      this.queryOptions.where.character = { [Op.like]: `%${character}%` };
    }
    return this;
  }

  withUniverse(universe) {
    if (universe) {
      this.queryOptions.where.universe = { [Op.like]: `%${universe}%` };
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
    return this.queryOptions;
  }
}

module.exports = ProductQueryBuilder;