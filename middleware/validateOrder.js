const Joi = require('joi'); // Instala: npm install joi

const orderSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      productId: Joi.number().integer().positive().required(),
      quantity: Joi.number().integer().min(1).required()
    })
  ).min(1).required(),
  paymentMethod: Joi.string().valid('CreditCard').required(),
  paymentDetails: Joi.object({
    cardToken: Joi.string().required(),
    currency: Joi.string().valid('USD', 'EUR', 'COP').default('USD')
  }).required()
});

const validateOrder = (req, res, next) => {
  const { error } = orderSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const messages = error.details.map(detail => detail.message);
    return res.status(400).json({
      status: 'fail',
      message: 'Validación fallida',
      errors: messages
    });
  }
  
  next();
};

module.exports = validateOrder;