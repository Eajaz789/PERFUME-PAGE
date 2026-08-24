require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Coupon = require('./models/Coupon');

const products = [
  {
    name: 'ÉLORIA NOIR',
    slug: 'eloria-noir',
    description: 'Dark. Magnetic. Unforgettable. A sophisticated woody fragrance that commands attention with its deep, mysterious character. Crafted around rare oud, precious saffron and rich leather notes.',
    shortDescription: 'Dark. Magnetic. Unforgettable.',
    price: 8900,
    category: 'woody',
    gender: 'unisex',
    fragranceFamily: 'Woody • Amber • Oud',
    topNotes: ['Bergamot', 'Pink Pepper', 'Cardamom'],
    heartNotes: ['Rose', 'Iris', 'Cedar'],
    baseNotes: ['Oud', 'Amber', 'Musk', 'Leather'],
    image: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80',
    images: ['https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80'],
    rating: 4.8,
    reviewsCount: 124,
    stock: 15,
    featured: true,
    bestSeller: true,
    newArrival: false
  },
  {
    name: 'ÉLORIA ROSE',
    slug: 'eloria-rose',
    description: 'Elegant. Soft. Expressive. A timeless floral composition that celebrates the queen of flowers in her most graceful form. Modern yet timeless.',
    shortDescription: 'Elegant. Soft. Expressive.',
    price: 7500,
    category: 'floral',
    gender: 'female',
    fragranceFamily: 'Rose • Musk • Vanilla',
    topNotes: ['Pink Pepper', 'Bergamot', 'Neroli'],
    heartNotes: ['Rose', 'Peony', 'Jasmine'],
    baseNotes: ['Musk', 'Vanilla', 'Cedar'],
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80',
    images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80'],
    rating: 4.7,
    reviewsCount: 98,
    stock: 20,
    featured: true,
    bestSeller: true,
    newArrival: false
  },
  {
    name: 'ÉLORIA VERT',
    slug: 'eloria-vert',
    description: 'Clean. Vibrant. Effortless. A fresh green fragrance that captures the essence of nature in its purest, most revitalizing form. Perfect for everyday elegance.',
    shortDescription: 'Clean. Vibrant. Effortless.',
    price: 6900,
    category: 'fresh',
    gender: 'unisex',
    fragranceFamily: 'Citrus • Green • Cedar',
    topNotes: ['Bergamot', 'Lemon', 'Mint'],
    heartNotes: ['Green Tea', 'Basil', 'Lily'],
    baseNotes: ['Cedar', 'Moss', 'Vetiver'],
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80',
    images: ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80'],
    rating: 4.6,
    reviewsCount: 76,
    stock: 18,
    featured: true,
    bestSeller: false,
    newArrival: true
  },
  {
    name: 'ÉLORIA OUD',
    slug: 'eloria-oud',
    description: 'Rare. Precious. Timeless. An opulent oud fragrance that speaks of ancient traditions and modern luxury. The crown jewel of our collection.',
    shortDescription: 'Rare. Precious. Timeless.',
    price: 11900,
    category: 'oud',
    gender: 'unisex',
    fragranceFamily: 'Oud • Saffron • Leather',
    topNotes: ['Saffron', 'Bergamot', 'Lavender'],
    heartNotes: ['Oud', 'Rose', 'Cinnamon'],
    baseNotes: ['Leather', 'Amber', 'Sandalwood'],
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80',
    images: ['https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80'],
    rating: 4.9,
    reviewsCount: 156,
    stock: 8,
    featured: true,
    bestSeller: true,
    newArrival: false
  },
  {
    name: 'ÉLORIA AMBRE',
    slug: 'eloria-ambre',
    description: 'Warm. Sensual. Enveloping. A rich amber fragrance that wraps you in comfort and sophistication. Perfect for evening elegance.',
    shortDescription: 'Warm. Sensual. Enveloping.',
    price: 8500,
    category: 'amber',
    gender: 'unisex',
    fragranceFamily: 'Amber • Vanilla • Sandalwood',
    topNotes: ['Bergamot', 'Cinnamon', 'Nutmeg'],
    heartNotes: ['Amber', 'Vanilla', 'Tonka'],
    baseNotes: ['Sandalwood', 'Musk', 'Patchouli'],
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80',
    images: ['https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80'],
    rating: 4.5,
    reviewsCount: 62,
    stock: 12,
    featured: true,
    bestSeller: false,
    newArrival: true
  },
  {
    name: 'ÉLORIA BLANC',
    slug: 'eloria-blanc',
    description: 'Pure. Serene. Radiant. A luminous white floral fragrance that evokes the tranquility of a perfect morning. Clean and sophisticated.',
    shortDescription: 'Pure. Serene. Radiant.',
    price: 7200,
    category: 'floral',
    gender: 'female',
    fragranceFamily: 'White Floral • Musk • Sandalwood',
    topNotes: ['Bergamot', 'White Peach', 'Mandarin'],
    heartNotes: ['Jasmine', 'Orange Blossom', 'Lily'],
    baseNotes: ['Musk', 'Sandalwood', 'Vanilla'],
    image: 'https://bonanzasatrangi.com/cdn/shop/files/1_28cbede5-f153-4bd2-941b-112bd11dc507.jpg?v=1773222944&width=720',
    images: ['https://bonanzasatrangi.com/cdn/shop/files/1_28cbede5-f153-4bd2-941b-112bd11dc507.jpg?v=1773222944&width=720'],
    rating: 4.4,
    reviewsCount: 45,
    stock: 25,
    featured: false,
    bestSeller: false,
    newArrival: true
  }
];

const coupons = [
  {
    code: 'WELCOME10',
    discountType: 'percentage',
    discountValue: 10,
    minimumOrderValue: 3000,
    maximumDiscount: 1000,
    expiryDate: new Date('2027-12-31'),
    usageLimit: 1000,
    active: true
  },
  {
    code: 'ELORIA500',
    discountType: 'fixed',
    discountValue: 500,
    minimumOrderValue: 5000,
    maximumDiscount: null,
    expiryDate: new Date('2027-06-30'),
    usageLimit: 500,
    active: true
  },
  {
    code: 'FIRSTORDER',
    discountType: 'percentage',
    discountValue: 15,
    minimumOrderValue: 2000,
    maximumDiscount: 1500,
    expiryDate: new Date('2027-12-31'),
    usageLimit: 2000,
    active: true
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('ÉLORIA database connected');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert new products
    await Product.insertMany(products);
    console.log('6 products successfully seeded');

    // Clear existing coupons
    await Coupon.deleteMany({});
    console.log('Cleared existing coupons');

    // Insert new coupons
    await Coupon.insertMany(coupons);
    console.log('3 coupons successfully seeded');

    console.log('Database seeding completed');

    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
