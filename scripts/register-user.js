const AuthService = require('../services/authService');

(async () => {
  try {
    // Ensure DB is synchronized before registering
    const db = require('../config/database');
    if (db && db.sequelize) {
      // Force sync to ensure schema matches models in `models/` (dev only)
      await db.sequelize.sync({ force: true });
      console.log('Database synchronized (force: true)');
    } else if (typeof db.syncDatabase === 'function') {
      await db.syncDatabase();
    }

    const payload = {
      nombreCompleto: 'Usuario Prueba',
      email: 'user.test+001@example.com',
      password: 'password123',
      cedula: '999888777'
    };

    const result = await AuthService.register(payload);
    console.log('Registro exitoso:');
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Error registrando usuario:');
    console.dir(err, { depth: null });
    process.exit(1);
  }
})();
