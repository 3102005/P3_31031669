const { sequelize } = require('../config/database');
const User = require('./User');

async function initializeDatabase() {
  try {
    console.log('🔄 Inicializando base de datos...');
    
    // Autenticar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
    
    // Sincronizar modelos
    await sequelize.sync({ 
      force: process.env.NODE_ENV === 'test',
      alter: process.env.NODE_ENV === 'development'
    });
    console.log('✅ Modelos sincronizados con la base de datos.');
    
    // Crear usuario admin solo en desarrollo
    if (process.env.NODE_ENV === 'development') {
      try {
        const existingAdmin = await User.findOne({ where: { email: 'admin@example.com' } });
        if (!existingAdmin) {
          await User.create({
            nombreCompleto: 'Administrador',
            email: 'admin@example.com',
            password: 'admin123',
            cedula: '000000000',
            seccion: 'Administración'
          });
          console.log('✅ Usuario administrador creado: admin@example.com / admin123');
        } else {
          console.log('ℹ️ Usuario administrador ya existe');
        }
      } catch (error) {
        console.log('❌ Error creando usuario admin:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error inicializando la base de datos:', error);
    throw error;
  }
}

// Solo ejecutar si es llamado directamente
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('✅ Inicialización completada');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error durante la inicialización:', error);
      process.exit(1);
    });
}

module.exports = initializeDatabase;