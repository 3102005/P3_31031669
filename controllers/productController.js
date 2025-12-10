// src/controllers/productController.js
const ProductRepository = require('../repositories/ProductRepository');
const ProductQueryBuilder = require('../services/ProductQueryBuilder');
const asyncHandler = require('../utils/asyncHandler');
const { Product, Category, Tag } = require('../models');

const productRepo = new ProductRepository();

// Endpoint público con filtros avanzados
exports.getProducts = async (req, res) => {
  try {
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
      universe,
      exclusive
    } = req.query;

    // Usar Builder Pattern para construir consulta
    const queryBuilder = new ProductQueryBuilder()
      .withCategory(category)
      .withTags(tags)
      .withPriceRange(price_min, price_max)
      .withSearch(search)
      .withMovie(movie)
      .withCharacter(character)
      .withEdition(edition)
      .withUniverse(universe)
      .withExclusive(exclusive);

    // Aplicar paginación sólo si el cliente la solicitó explícitamente
    // o si envió cualquier filtro. Si no hay filtros ni parámetros de
    // paginación, devolvemos TODOS los productos (sin limit).
    const hasFilters = Boolean(
      category || tags || price_min || price_max || search || movie || character || edition || universe || (typeof exclusive !== 'undefined')
    );

    if (hasFilters || req.query.page || req.query.limit) {
      queryBuilder.withPagination(page, limit);
    }

    // Usar Repository Pattern para acceso a datos
    const queryOptions = queryBuilder.build();
    console.log('DEBUG product queryOptions:', JSON.stringify(queryOptions));
    const { rows: products, count } = await productRepo.findAllWithFilters(queryOptions);

    // Si no se aplicó paginación, devolver metadata acorde (todos los productos)
    if (!queryBuilder.queryOptions || !queryBuilder.build().limit) {
      res.jsend.success({
        products,
        pagination: {
          page: 1,
          limit: products.length,
          total: count,
          pages: 1
        }
      });
    } else {
      res.jsend.success({
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      });
    }
  } catch (error) {
    console.error(error && error.stack ? error.stack : error);
    res.status(500).jsend.error(error.message);
  }
};
// Endpoint self-healing
exports.getProductBySlug = async (req, res) => {
  try {
    const { id, slug } = req.params;
    
    const product = await Product.findByPk(id, {
      include: [
        { model: Category, as: 'category' },
        { model: Tag, as: 'tags', through: { attributes: [] } }
      ]
    });

    if (!product) {
      return res.status(404).jsend.fail('Product not found');
    }

    // Self-healing: Redirigir si el slug no coincide
    if (product.slug !== slug) {
      // Preserve mount path if called through /products router (req.baseUrl)
      const base = req.baseUrl || '';
      return res.redirect(301, `${base}/p/${id}-${product.slug}`);
    }

    res.jsend.success(product);
  } catch (error) {
    res.status(500).jsend.error(error.message);
  }
};

exports.getProductById = asyncHandler(async (req, res) => {
  const product = await productRepo.findById(req.params.id);
  if (!product) return res.status(404).jsend.fail('Product not found');
  res.jsend.success(product);
});

// Endpoints protegidos
exports.createProduct = asyncHandler(async (req, res) => {
  const product = await productRepo.create(req.body);
  res.status(201).jsend.success(product);
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await productRepo.update(req.params.id, req.body);
  if (!product) {
    return res.status(404).jsend.fail('Product not found');
  }
  res.jsend.success(product);
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const result = await productRepo.delete(req.params.id);
  if (!result) {
    return res.status(404).jsend.fail('Product not found');
  }
  res.jsend.success({ message: 'Product deleted successfully' });
});

// module.exports not needed because we used named exports above