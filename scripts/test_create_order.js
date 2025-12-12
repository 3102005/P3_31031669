(async ()=>{
  try{
    process.env.NODE_ENV = process.env.NODE_ENV || 'test';
    const db = require('../models');
    const OrderRepo = require('../repositories/OrderRepository');
    const orderRepo = new OrderRepo(db.Order);
    const sequelize = db.sequelize;
    const transaction = await sequelize.transaction();
    try{
      const orderData = { userId: 1, status: 'COMPLETED', totalAmount: 200, paymentMethod: 'CreditCard', transactionId: 'txn_test' };
      const items = [{ productId: 1, quantity: 2, unitPrice: 100.00, subtotal: 200 }];
      const res = await orderRepo.createOrderWithItems(orderData, items, transaction);
      await transaction.commit();
      console.log('Order created:', res.order.id);
    } catch(e){
      console.error('Inner error:', e);
      if (transaction && !transaction.finished) await transaction.rollback();
    }
  }catch(e){ console.error(e); process.exit(1); }
})();
