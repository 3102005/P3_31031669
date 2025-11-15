const ProductRepository = require('../repositories/ProductRepository');
const productRepo = new ProductRepository();

const productsController = {
  // GET /products - PÚBLICO
  async getProducts(req, res) {
    try {
      const result = await productRepo.findAll(req.query);
      
      res.json({
        status: 'success',
        data: {
          products: result.rows,
          pagination: {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10,
            total: result.count,
            pages: Math.ceil(result.count / (parseInt(req.query.limit) || 10))
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  },

  // GET /p/:id-:slug - PÚBLICO con Self-healing
  async getProductBySlug(req, res) {
    try {
      const { id, slug } = req.params;
      const product = await productRepo.findById(id);

      if (!product) {
        return res.status(404).json({
          status: 'error',
          message: 'Product not found'
        });
      }

      // Self-healing: Si el slug no coincide, redirigir al correcto
      if (product.slug !== slug) {
        return res.redirect(301, `/p/${id}-${product.slug}`);
      }

      res.json({
        status: 'success',
        data: product
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  },

  // GET /products/:id - PROTEGIDO
  async getProductById(req, res) {
    try {
      const product = await productRepo.findById(req.params.id);

      if (!product) {
        return res.status(404).json({
          status: 'error',
          message: 'Product not found'
        });
      }

      res.json({
        status: 'success',
        data: product
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  },

  // POST /products - PROTEGIDO
  async createProduct(req, res) {
    try {
      const productData = req.body;
      
      // El slug se genera automáticamente en el modelo via hooks
      // Remover slug si viene en el body para forzar generación automática
      delete productData.slug;

      const product = await productRepo.create(productData);
      
      // Asociar tags si se proporcionan
      if (req.body.tags && Array.isArray(req.body.tags)) {
        await product.setTags(req.body.tags);
      }

      const fullProduct = await productRepo.findById(product.id);

      res.status(201).json({
        status: 'success',
        data: fullProduct
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  },

  // PUT /products/:id - PROTEGIDO
  async updateProduct(req, res) {
    try {
      const productData = req.body;
      
      // Remover slug para forzar regeneración automática si name/sku cambian
      delete productData.slug;

      const product = await productRepo.update(req.params.id, productData);
      
      if (!product) {
        return res.status(404).json({
          status: 'error',
          message: 'Product not found'
        });
      }

      // Actualizar tags si se proporcionan
      if (req.body.tags && Array.isArray(req.body.tags)) {
        await product.setTags(req.body.tags);
      }

      const fullProduct = await productRepo.findById(product.id);

      res.json({
        status: 'success',
        data: fullProduct
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  },

  // DELETE /products/:id - PROTEGIDO
  async deleteProduct(req, res) {
    try {
      const product = await productRepo.delete(req.params.id);

      if (!product) {
        return res.status(404).json({
          status: 'error',
          message: 'Product not found'
        });
      }

      res.json({
        status: 'success',
        data: null,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
};

module.exports = productsController;