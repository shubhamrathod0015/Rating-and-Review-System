import { prisma } from '../config/database.js';

const usersData = [
  { name: 'John Doe', email: 'john.doe@example.com' },
  { name: 'Jane Smith', email: 'jane.smith@example.com' },
  { name: 'Mike Johnson', email: 'mike.johnson@example.com' },
  { name: 'Sarah Wilson', email: 'sarah.wilson@example.com' },
];

const productsData = [
  {
    id: 1,
    name: 'iPhone 15 Pro',
    description: 'Latest iPhone with A17 Pro chip and titanium design',
    price: 999.99,
    category: 'Electronics',
    imageUrl: 'https://via.placeholder.com/300x300?text=iPhone+15+Pro',
  },
  {
    id: 2,
    name: 'Samsung Galaxy S24',
    description: 'Flagship Android phone with AI features',
    price: 899.99,
    category: 'Electronics',
    imageUrl: 'https://via.placeholder.com/300x300?text=Galaxy+S24',
  },
  {
    id: 3,
    name: 'MacBook Air M3',
    description: 'Lightweight laptop with M3 chip',
    price: 1199.99,
    category: 'Computers',
    imageUrl: 'https://via.placeholder.com/300x300?text=MacBook+Air',
  },
  {
    id: 4,
    name: 'Sony WH-1000XM5',
    description: 'Premium noise-canceling headphones',
    price: 399.99,
    category: 'Audio',
    imageUrl: 'https://via.placeholder.com/300x300?text=Sony+Headphones',
  },
  {
    id: 5,
    name: 'iPad Pro 12.9"',
    description: 'Professional tablet with M2 chip',
    price: 1099.99,
    category: 'Tablets',
    imageUrl: 'https://via.placeholder.com/300x300?text=iPad+Pro',
  },
  {
    id: 6,
    name: 'Dell XPS 13',
    description: 'Ultra-portable Windows laptop',
    price: 999.99,
    category: 'Computers',
    imageUrl: 'https://via.placeholder.com/300x300?text=Dell+XPS+13',
  },
  {
    id: 7,
    name: 'AirPods Pro 2',
    description: 'Wireless earbuds with active noise cancellation',
    price: 249.99,
    category: 'Audio',
    imageUrl: 'https://via.placeholder.com/300x300?text=AirPods+Pro',
  },
  {
    id: 8,
    name: 'Nintendo Switch OLED',
    description: 'Gaming console with OLED screen',
    price: 349.99,
    category: 'Gaming',
    imageUrl: 'https://via.placeholder.com/300x300?text=Nintendo+Switch',
  },
];

const reviewsData = [
  {
    productId: 1,
    userId: 1,
    rating: 5,
    reviewText: 'Amazing phone! The camera quality is outstanding and the titanium build feels premium.',
    tags: ['premium', 'camera', 'fast'],
    userName: 'John Doe',
    userEmail: 'john.doe@example.com',
  },
  {
    productId: 1,
    userId: 2,
    rating: 4,
    reviewText: 'Great phone but quite expensive. Battery life could be better.',
    tags: ['expensive', 'battery'],
    userName: 'Jane Smith',
    userEmail: 'jane.smith@example.com',
  },
  {
    productId: 2,
    userId: 3,
    rating: 5,
    reviewText: 'Best Android phone I\'ve ever used. The AI features are incredible!',
    tags: ['android', 'ai', 'best'],
    userName: 'Mike Johnson',
    userEmail: 'mike.johnson@example.com',
  },
  {
    productId: 3,
    userId: 4,
    rating: 5,
    reviewText: 'Perfect laptop for work and travel. Light weight and amazing performance.',
    tags: ['lightweight', 'performance', 'work'],
    userName: 'Sarah Wilson',
    userEmail: 'sarah.wilson@example.com',
  },
  {
    productId: 4,
    userId: 1,
    rating: 4,
    reviewText: 'Excellent noise cancellation. Great for flights and commuting.',
    tags: ['noise-canceling', 'travel', 'commute'],
    userName: 'John Doe',
    userEmail: 'john.doe@example.com',
  },
];

async function seed() {
  console.log('Starting database seeding...');
  
  try {
    // Check if seeding is needed
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      console.log('Database already seeded. Skipping...');
      return;
    }

    // Insert users
    console.log('Creating users...');
    for (const user of usersData) {
      await prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: user,
      });
    }

    // Insert products
    console.log('Creating products...');
    for (const product of productsData) {
      await prisma.product.upsert({
        where: { id: product.id },
        update: {},
        create: {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          imageUrl: product.imageUrl,
        },
      });
    }

    // Insert reviews
    console.log('Creating reviews...');
    for (const review of reviewsData) {
      await prisma.review.upsert({
        where: {
          unique_user_product: {
            userId: review.userId,
            productId: review.productId,
          },
        },
        update: {},
        create: {
          productId: review.productId,
          userId: review.userId,
          rating: review.rating,
          reviewText: review.reviewText,
          tags: review.tags,
          userName: review.userName,
          userEmail: review.userEmail,
        },
      });
    }

    // Update product stats
    console.log('Updating product stats...');
    for (const product of productsData) {
      const reviews = await prisma.review.findMany({
        where: { productId: product.id },
      });

      const ratings = reviews.map(r => r.rating).filter(r => r !== null);
      const avg = ratings.length > 0 
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
        : 0;

      await prisma.product.update({
        where: { id: product.id },
        data: {
          averageRating: parseFloat(avg.toFixed(1)),
          totalReviews: reviews.length,
        },
      });

      // Process review tags
      for (const review of reviews) {
        if (review.tags && Array.isArray(review.tags)) {
          for (const tag of review.tags) {
            const normalizedTag = tag.toLowerCase().trim();
            if (normalizedTag) {
              await prisma.reviewTag.upsert({
                where: {
                  unique_product_tag: {
                    productId: product.id,
                    tagName: normalizedTag,
                  },
                },
                update: { count: { increment: 1 } },
                create: {
                  productId: product.id,
                  tagName: normalizedTag,
                  count: 1,
                },
              });
            }
          }
        }
      }
    }

    console.log('✅ Seed completed successfully');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

// Execute seed only when run directly
if (process.argv[1] === import.meta.filename) {
  seed()
    .catch(err => {
      console.error('Error during seeding:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export default seed;