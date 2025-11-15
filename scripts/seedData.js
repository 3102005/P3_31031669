// scripts/seedData.js
const { Category, Tag, Product } = require('../src/models');

const seedData = async () => {
  // Crear categorías
  const categories = await Category.bulkCreate([
    { name: 'Avengers', description: 'Figuras de los Vengadores' },
    { name: 'Villains', description: 'Figuras de villanos' }
  ]);

  // Crear tags
  const tags = await Tag.bulkCreate([
    { name: 'exclusive' },
    { name: 'limited-edition' },
    { name: 'glow-in-dark' }
  ]);

  // Crear productos de ejemplo
  await Product.create({
    name: 'Iron Man Mark L',
    description: 'Iron Man con armadura Mark L de Infinity War',
    price: 34.99,
    stock: 50,
    character: 'Iron Man',
    movie: 'Infinity War',
    edition: 'Special',
    number: 456,
    exclusive: true,
    CategoryId: categories[0].id,
    Tags: [tags[0], tags[1]]
  }, {
    include: [Tag]
  });
};