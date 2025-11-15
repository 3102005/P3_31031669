const { sequelize } = require('../models/index');
const { Category, Tag, Product } = require('../models');

const seedDatabase = async () => {
  try {
    await sequelize.sync({ force: false });
    
    // Crear categorías
    const [avengers, ironMan, capAmerica] = await Category.bulkCreate([
      { name: 'Avengers', description: 'Películas de Avengers' },
      { name: 'Iron Man', description: 'Figuras de Iron Man' },
      { name: 'Captain America', description: 'Figuras de Captain America' }
    ], { ignoreDuplicates: true });

    // Crear tags
    const [limited, exclusive, glow, jumbo] = await Tag.bulkCreate([
      { name: 'limited-edition' },
      { name: 'exclusive' },
      { name: 'glow-in-dark' },
      { name: 'jumbo-size' }
    ], { ignoreDuplicates: true });

    // ✅ CREAR PRODUCTOS FUNKO POP AVENGERS
    const products = await Product.bulkCreate([
      {
        name: "Iron Man Mark LXXXV",
        description: "Funko Pop de Iron Man con traje de Endgame",
        price: 29.99,
        stock: 50,
        sku: "AVG001",
        movie: "Avengers: Endgame",
        character: "Iron Man",
        edition: "Standard",
        releaseYear: 2024,
        isExclusive: false,
        slug: "iron-man-mark-lxxxv-avg001",
        CategoryId: avengers.id
      },
      {
        name: "Captain America con Mjolnir",
        description: "Captain America con el martillo de Thor en Endgame",
        price: 32.99,
        stock: 30,
        sku: "AVG002",
        movie: "Avengers: Endgame",
        character: "Captain America",
        edition: "Exclusive",
        releaseYear: 2024,
        isExclusive: true,
        slug: "captain-america-mjolnir-avg002",
        CategoryId: avengers.id
      },
      {
        name: "Thor God of Thunder",
        description: "Thor con Stormbreaker y brazo luminoso",
        price: 27.99,
        stock: 40,
        sku: "AVG003",
        movie: "Avengers: Infinity War",
        character: "Thor",
        edition: "Standard",
        releaseYear: 2024,
        isExclusive: false,
        slug: "thor-god-thunder-avg003",
        CategoryId: avengers.id
      },
      {
        name: "Black Widow Vormir",
        description: "Black Widow con traje blanco de Vormir",
        price: 26.99,
        stock: 35,
        sku: "AVG004",
        movie: "Avengers: Endgame",
        character: "Black Widow",
        edition: "Limited",
        releaseYear: 2024,
        isExclusive: true,
        slug: "black-widow-vormir-avg004",
        CategoryId: avengers.id
      },
      {
        name: "Thanos con Guantelete Dorado",
        description: "Thanos con el guantelete del infinito completo",
        price: 34.99,
        stock: 25,
        sku: "AVG005",
        movie: "Avengers: Infinity War",
        character: "Thanos",
        edition: "Jumbo",
        releaseYear: 2024,
        isExclusive: false,
        slug: "thanos-guantelete-dorado-avg005",
        CategoryId: avengers.id
      },
      {
        name: "Hulk con Nano Gauntlet",
        description: "Hulk con el guantelete nano en Endgame",
        price: 31.99,
        stock: 45,
        sku: "AVG006",
        movie: "Avengers: Endgame",
        character: "Hulk",
        edition: "Standard",
        releaseYear: 2024,
        isExclusive: false,
        slug: "hulk-nano-gauntlet-avg006",
        CategoryId: avengers.id
      },
      {
        name: "Spider-Man Iron Spider",
        description: "Spider-Man con traje Iron Spider",
        price: 28.99,
        stock: 60,
        sku: "AVG007",
        movie: "Avengers: Infinity War",
        character: "Spider-Man",
        edition: "Exclusive",
        releaseYear: 2024,
        isExclusive: true,
        slug: "spider-man-iron-spider-avg007",
        CategoryId: avengers.id
      }
    ], { ignoreDuplicates: true });

    // ✅ ASOCIAR TAGS A PRODUCTOS
    const ironManProduct = await Product.findOne({ where: { sku: 'AVG001' } });
    await ironManProduct.addTags([exclusive.id]);

    const capProduct = await Product.findOne({ where: { sku: 'AVG002' } });
    await capProduct.addTags([limited.id, exclusive.id]);

    const thanosProduct = await Product.findOne({ where: { sku: 'AVG005' } });
    await thanosProduct.addTags([jumbo.id]);

    console.log(`✅ Database seeded with ${products.length} Avengers Funko Pop products`);
  } catch (error) {
    console.error('❌ Seeding error:', error);
  }
};

seedDatabase();