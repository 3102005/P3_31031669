class PaymentStrategy {
  /**
   * Procesa un pago
   * @param {Object} paymentDetails - Detalles del pago
   * @param {Number} amount - Monto a cobrar
   * @returns {Promise<Object>} - Resultado del pago
   */
  async processPayment(paymentDetails, amount) {
    throw new Error('Método processPayment() debe ser implementado');
  }
}

module.exports = PaymentStrategy;