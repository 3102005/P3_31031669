// src/controllers/productController.js
const ProductRepository = require('../repositories/ProductRepository');
const ProductQueryBuilder = require('../services/ProductQueryBuilder');
const asyncHandler = require('../utils/asyncHandler');

const productRepo = new ProductRepository();

// Endpoint público con filtros avanzados
exports.getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    category,
    tags,
    price_min,
    price_max,
    search,
    character,
    movie,
    edition,
    exclusive
  } = req.query;

  const queryBuilder = new ProductQueryBuilder()
    .withPagination(page, limit)
    .withCategory(category)
    .withTags(tags ? tags.split(',') : null)
    .withPriceRange(price_min, price_max)
    .withSearch(search)
    .withCharacter(character)
    .withMovie(movie)
    .withEdition(edition)
    .withExclusive(exclusive);

  const { rows: products, count } = await productRepo.model.findAndCountAll(queryBuilder.build());

  res.jsend.success({
    products,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      pages: Math.ceil(count / limit)
    }
  });
});

// Endpoint self-healing
exports.getProductBySlug = asyncHandler(async (req, res) => {
  const { id, slug } = req.params;
  
  const product = await productRepo.findById(id);
  if (!product) {
    return res.status(404).jsend.fail('Product not found');
  }

  // Self-healing: Si el slug no coincide, redirigir a la URL correcta
  if (product.slug !== slug) {
    return res.redirect(301, `/p/${id}-${product.slug}`);
  }

  res.jsend.success(product);
});

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