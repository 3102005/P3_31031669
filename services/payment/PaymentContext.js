class PaymentContext {
  constructor(strategy = null) {
    this.strategy = strategy;
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  async executePayment(paymentDetails, amount) {
    if (!this.strategy) {
      throw new Error('Estrategia de pago no configurada');
    }
    return await this.strategy.processPayment(paymentDetails, amount);
  }
}

module.exports = PaymentContext;