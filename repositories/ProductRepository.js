const { Product, Category, Tag } = require('../models/associations');
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
      edition,
      isExclusive
    } = filters;

    const queryBuilder = new ProductQueryBuilder()
      .paginate(page, limit)
      .filterByCategory(category)
      .filterByTags(tags)
      .filterByPrice(price_min, price_max)
      .search(search)
      .filterByMovie(movie)
      .filterByCharacter(character)
      .filterByEdition(edition)
      .filterByExclusive(isExclusive);

    const query = queryBuilder.build();
    
    // Incluir relaciones básicas
    if (!query.include.find(inc => inc.association === 'category')) {
      query.include.push({ association: 'category' });
    }
    if (!query.include.find(inc => inc.association === 'tags')) {
      query.include.push({ association: 'tags' });
    }

    return await Product.findAndCountAll(query);
  }

  async findById(id) {
    return await Product.findByPk(id, {
      include: [
        { association: 'category' },
        { association: 'tags' }
      ]
    });
  }

  async findBySlug(slug) {
    return await Product.findOne({
      where: { slug },
      include: [
        { association: 'category' },
        { association: 'tags' }
      ]
    });
  }

  async create(productData) {
    const p = await Product.create(productData);
    try {
      console.log('DEBUG Product created:', { id: p.id, slug: p.slug });
      const all = await Product.findAll();
      console.log('DEBUG All products count:', all.length, 'first:', all[0] && all[0].toJSON && all[0].toJSON());
    } catch (e) {
      // ignore logging errors
    }
    return p;
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

  async generateSlug(name, sku) {
    const baseSlug = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${sku.toLowerCase()}`;
    let slug = baseSlug;
    let counter = 1;

    while (await this.findBySlug(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }
}

module.exports = ProductRepository;