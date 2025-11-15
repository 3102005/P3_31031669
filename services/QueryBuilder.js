const { Op } = require('sequelize');

class ProductQueryBuilder {
  constructor() {
    this.query = {
      where: {},
      include: [],
      distinct: true
    };
  }

  paginate(page = 1, limit = 10) {
    const offset = (page - 1) * parseInt(limit);
    this.query.offset = offset;
    this.query.limit = parseInt(limit);
    return this;
  }

  filterByCategory(category) {
    if (category) {
      this.query.include.push({
        model: require('../models/Category'),
        as: 'category',
        where: { 
          [Op.or]: [
            { id: category },
            { name: { [Op.like]: `%${category}%` } }
          ]
        },
        required: true
      });
    }
    return this;
  }

  filterByTags(tags) {
    if (tags) {
      const tagIds = Array.isArray(tags) ? tags : tags.split(',');
      this.query.include.push({
        model: require('../models/Tag'),
        as: 'tags',
        where: { id: { [Op.in]: tagIds } },
        through: { attributes: [] },
        required: true
      });
    }
    return this;
  }

  filterByPrice(price_min, price_max) {
    if (price_min || price_max) {
      this.query.where.price = {};
      if (price_min) this.query.where.price[Op.gte] = parseFloat(price_min);
      if (price_max) this.query.where.price[Op.lte] = parseFloat(price_max);
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

  // Filtros personalizados Avengers Funko Pop
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

  build() {
    // Incluir relaciones básicas si no están presentes
    if (!this.query.include.find(inc => inc.as === 'category')) {
      this.query.include.push({
        model: require('../models/Category'),
        as: 'category'
      });
    }
    
    if (!this.query.include.find(inc => inc.as === 'tags')) {
      this.query.include.push({
        model: require('../models/Tag'),
        as: 'tags',
        through: { attributes: [] }
      });
    }

    return this.query;
  }
}

module.exports = ProductQueryBuilder;