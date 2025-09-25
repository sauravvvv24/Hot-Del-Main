import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const sampleProducts = [
  // Dairy Products (6 products)
  {
    name: 'Fresh Milk 1L',
    price: 55,
    description: 'Pure and fresh cow milk, perfect for daily consumption',
    category: 'Dairy Products',
    image: '/src/assets/amul_milk_image.png',
    stock: 50,
    unit: '1L',
    brand: 'Amul',
    featured: true
  },
  {
    name: 'Paneer 500g',
    price: 150,
    description: 'Fresh homemade paneer, perfect for curries and snacks',
    category: 'Dairy Products',
    image: '/src/assets/paneer_image.png',
    stock: 30,
    unit: '500g',
    brand: 'Homemade',
    featured: false
  },
  {
    name: 'Curd 1KG',
    price: 60,
    description: 'Thick and creamy curd, great for raita and desserts',
    category: 'Dairy Products',
    image: '/src/assets/Curd.png',
    stock: 40,
    unit: '1KG',
    brand: 'Amul',
    featured: false
  },
  {
    name: 'Butter 250g',
    price: 120,
    description: 'Rich and creamy butter, perfect for cooking and baking',
    category: 'Dairy Products',
    image: '/src/assets/Amul Butter.webp',
    stock: 25,
    unit: '250g',
    brand: 'Amul',
    featured: true
  },
  {
    name: 'Cheese 200g',
    price: 180,
    description: 'Melted cheese perfect for sandwiches and pizzas',
    category: 'Dairy Products',
    image: '/src/assets/amul Cheese.webp',
    stock: 35,
    unit: '200g',
    brand: 'Amul',
    featured: false
  },
  {
    name: 'Ghee 500ml',
    price: 250,
    description: 'Pure desi ghee, essential for traditional cooking',
    category: 'Dairy Products',
    image: '/src/assets/amul_milk_image.png',
    stock: 20,
    unit: '500ml',
    brand: 'Amul',
    featured: false
  },

  // Fruits (6 products)
  {
    name: 'Fresh Apples 1KG',
    price: 120,
    description: 'Sweet and crunchy apples, rich in fiber',
    category: 'Fruits',
    image: '/src/assets/apple_image.png',
    stock: 45,
    unit: '1KG',
    brand: 'Fresh Farm',
    featured: true
  },
  {
    name: 'Bananas 1 Dozen',
    price: 60,
    description: 'Ripe and sweet bananas, perfect for smoothies',
    category: 'Fruits',
    image: '/src/assets/banana_image_1.png',
    stock: 60,
    unit: '1 Dozen',
    brand: 'Fresh Farm',
    featured: false
  },
  {
    name: 'Mangoes 1KG',
    price: 80,
    description: 'Sweet and juicy mangoes, seasonal favorite',
    category: 'Fruits',
    image: '/src/assets/mango_image_1.png',
    stock: 30,
    unit: '1KG',
    brand: 'Fresh Farm',
    featured: true
  },
  {
    name: 'Grapes 500g',
    price: 100,
    description: 'Sweet and seedless grapes, perfect for snacking',
    category: 'Fruits',
    image: '/src/assets/grapes_image_1.png',
    stock: 25,
    unit: '500g',
    brand: 'Fresh Farm',
    featured: false
  },
  {
    name: 'Oranges 1KG',
    price: 90,
    description: 'Juicy oranges rich in vitamin C',
    category: 'Fruits',
    image: '/src/assets/orange_image.png',
    stock: 40,
    unit: '1KG',
    brand: 'Fresh Farm',
    featured: false
  },
  {
    name: 'Pomegranate 1KG',
    price: 150,
    description: 'Fresh pomegranate seeds, antioxidant rich',
    category: 'Fruits',
    image: '/src/assets/apple_image.png',
    stock: 20,
    unit: '1KG',
    brand: 'Fresh Farm',
    featured: false
  },

  // Vegetables (6 products)
  {
    name: 'Fresh Potatoes 2KG',
    price: 40,
    description: 'Fresh potatoes perfect for all types of cooking',
    category: 'Vegetables',
    image: '/src/assets/potato_image_1.png',
    stock: 100,
    unit: '2KG',
    brand: 'Fresh Farm',
    featured: false
  },
  {
    name: 'Tomatoes 1KG',
    price: 30,
    description: 'Ripe and juicy tomatoes for curries and salads',
    category: 'Vegetables',
    image: '/src/assets/tomato_image.png',
    stock: 80,
    unit: '1KG',
    brand: 'Fresh Farm',
    featured: false
  },
  {
    name: 'Carrots 1KG',
    price: 50,
    description: 'Fresh carrots rich in beta carotene',
    category: 'Vegetables',
    image: '/src/assets/carrot_image.png',
    stock: 60,
    unit: '1KG',
    brand: 'Fresh Farm',
    featured: false
  },
  {
    name: 'Onions 2KG',
    price: 60,
    description: 'Fresh onions essential for all Indian cooking',
    category: 'Vegetables',
    image: '/src/assets/onion_image_1.png',
    stock: 90,
    unit: '2KG',
    brand: 'Fresh Farm',
    featured: false
  },
  {
    name: 'Spinach 500g',
    price: 40,
    description: 'Fresh spinach leaves, rich in iron',
    category: 'Vegetables',
    image: '/src/assets/spinach_image_1.png',
    stock: 35,
    unit: '500g',
    brand: 'Fresh Farm',
    featured: true
  },
  {
    name: 'Cauliflower 1KG',
    price: 45,
    description: 'Fresh cauliflower perfect for curries and stir-fries',
    category: 'Vegetables',
    image: '/src/assets/carrot_image.png',
    stock: 40,
    unit: '1KG',
    brand: 'Fresh Farm',
    featured: false
  },

  // Frozen Products (6 products)
  {
    name: 'Frozen Green Peas 1KG',
    price: 80,
    description: 'Frozen green peas, ready to cook',
    category: 'Frozen Products',
    image: '/src/assets/frozen green peas.jpeg',
    stock: 50,
    unit: '1KG',
    brand: 'Frozen Fresh',
    featured: false
  },
  {
    name: 'Mixed Vegetables 1KG',
    price: 120,
    description: 'Assorted frozen vegetables for quick cooking',
    category: 'Frozen Products',
    image: '/src/assets/frozen green peas.jpeg',
    stock: 40,
    unit: '1KG',
    brand: 'Frozen Fresh',
    featured: true
  },
  {
    name: 'Frozen Corn 500g',
    price: 70,
    description: 'Sweet frozen corn kernels',
    category: 'Frozen Products',
    image: '/src/assets/frozen green peas.jpeg',
    stock: 30,
    unit: '500g',
    brand: 'Frozen Fresh',
    featured: false
  },
  {
    name: 'French Fries 1KG',
    price: 150,
    description: 'Crispy frozen french fries',
    category: 'Frozen Products',
    image: '/src/assets/frozen green peas.jpeg',
    stock: 25,
    unit: '1KG',
    brand: 'Frozen Fresh',
    featured: false
  },
  {
    name: 'Fish Fingers 500g',
    price: 200,
    description: 'Breaded fish fingers, ready to fry',
    category: 'Frozen Products',
    image: '/src/assets/frozen green peas.jpeg',
    stock: 20,
    unit: '500g',
    brand: 'Frozen Fresh',
    featured: true
  },
  {
    name: 'Chicken Nuggets 500g',
    price: 180,
    description: 'Crispy chicken nuggets, perfect snack',
    category: 'Frozen Products',
    image: '/src/assets/frozen green peas.jpeg',
    stock: 30,
    unit: '500g',
    brand: 'Frozen Fresh',
    featured: false
  }
];

const seedProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert new products
    const insertedProducts = await Product.insertMany(sampleProducts);
    console.log(`Successfully seeded ${insertedProducts.length} products`);

    // Show category summary
    const categorySummary = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('Category Summary:');
    categorySummary.forEach(cat => {
      console.log(`${cat._id}: ${cat.count} products`);
    });

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

seedProducts(); 