const { sequelize } = require('../config/database');
(async ()=>{
  console.log('NODE_ENV=', process.env.NODE_ENV);
  try{
    await sequelize.sync({ force: true });
    console.log('Sync ok');
    process.exit(0);
  }catch(err){
    console.error('Sync error:', err && err.stack ? err.stack : err);
    process.exit(2);
  }
})();
