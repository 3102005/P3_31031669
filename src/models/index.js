// Compatibility shim for tests that import from src/models
const models = require('../../models');

// Export the real models object
module.exports = models;

// Also expose sequelize globally so tests that call `sequelize.sync()`
// without importing it still work (many tests reference global sequelize).
if (typeof global !== 'undefined' && models && models.sequelize) {
	global.sequelize = models.sequelize;
}
