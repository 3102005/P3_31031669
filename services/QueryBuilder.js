const { Op } = require('sequelize');

class ProductQueryBuilder {
  constructor() {
    this.query = {
      where: {},
      include: [],
      order: [['createdAt', 'DESC']]
    };
  }

  paginate(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    this.query.offset = offset;
    this.query.limit = parseInt(limit);
    return this;
  }

  filterByCategory(categoryId) {
    if (categoryId) {
      this.query.include.push({
        association: 'category',
        where: { id: categoryId },
        required: true
      });
    }
    return this;
  }

  filterByTags(tagIds) {
    if (tagIds) {
      const tagArray = Array.isArray(tagIds) ? tagIds : tagIds.split(',');
      this.query.include.push({
        association: 'tags',
        where: { id: { [Op.in]: tagArray } },
        required: true
      });
    }
    return this;
  }

  filterByPrice(min, max) {
    if (min || max) {
      this.query.where.price = {};
      if (min) this.query.where.price[Op.gte] = parseFloat(min);
      if (max) this.query.where.price[Op.lte] = parseFloat(max);
    }
    return this;
  }

  search(term) {
    if (term) {
      this.query.where[Op.or] = [
        { name: { [Op.like]: `%${term}%` } },
        { description: { [Op.like]: `%${term}%` } }
      ];
    }
    return this;
  }

  // Filtros personalizados para Avengers Funko Pop
  filterByMovie(movie) {
    if (movie) {
      this.query.where.movie = { [Op.like]: `%${movie}%` };
    }
    return this;
  }

  filterByCharacter(character) {
    if (character) {
      this.query.where.character = { [Op.like]: `%${character}%` };
    }
    return this;
  }

  filterByEdition(edition) {
    if (edition) {
      this.query.where.edition = edition;
    }
    return this;
  }

  filterByExclusive(isExclusive) {
    if (isExclusive !== undefined) {
      this.query.where.isExclusive = isExclusive === 'true';
    }
    return this;
  }

  build() {
    // Asegurar que las inclusiones sean únicas
    const uniqueIncludes = [];
    const includeMap = new Map();
    
    this.query.include.forEach(include => {
      const key = include.association;
      if (!includeMap.has(key)) {
        includeMap.set(key, include);
        uniqueIncludes.push(include);
      }
    });
    
    this.query.include = uniqueIncludes;
    return this.query;
  }
}

module.exports = ProductQueryBuilder;