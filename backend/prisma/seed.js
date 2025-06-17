import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    price: 999,
    category: 'Electronics',
    imageUrl: 'https://via.placeholder.com/300x300?text=iPhone+15+Pro',
  },
  {
    id: 2,
    name: 'Samsung Galaxy S24',
    description: 'Flagship Android phone with AI features',
    price: 899,
    category: 'Electronics',
    imageUrl: 'https://via.placeholder.com/300x300?text=Galaxy+S24',
  },
  {
    id: 3,
    name: 'MacBook Air M3',
    description: 'Lightweight laptop with M3 chip',
    price: 1199,
    category: 'Computers',
    imageUrl: 'https://via.placeholder.com/300x300?text=MacBook+Air',
  },
  {
    id: 4,
    name: 'Sony WH-1000XM5',
    description: 'Premium noise-canceling headphones',
    price: 399,
    category: 'Audio',
    imageUrl: 'https://via.placeholder.com/300x300?text=Sony+Headphones',
  },
  {
    id: 5,
    name: 'iPad Pro 12.9"',
    description: 'Professional tablet with M2 chip',
    price: 1099,
    category: 'Tablets',
    imageUrl: 'https://via.placeholder.com/300x300?text=iPad+Pro',
  },
  {
    id: 6,
    name: 'Dell XPS 13',
    description: 'Ultra-portable Windows laptop',
    price: 999,
    category: 'Computers',
    imageUrl: 'https://via.placeholder.com/300x300?text=Dell+XPS+13',
  },
  {
    id: 7,
    name: 'AirPods Pro 2',
    description: 'Wireless earbuds with active noise cancellation',
    price: 249,
    category: 'Audio',
    imageUrl: 'https://via.placeholder.com/300x300?text=AirPods+Pro',
  },
  {
    id: 8,
    name: 'Nintendo Switch OLED',
    description: 'Gaming console with OLED screen',
    price: 349,
    category: 'Gaming',
    imageUrl: 'https://via.placeholder.com/300x300?text=Nintendo+Switch',
  },
];

const reviewsData = [
  {
    productId: 1,
    userId: 1,
    userName: 'John Doe',
    userEmail: 'john.doe@example.com',
    rating: 5,
    reviewText: 'Amazing phone! The camera quality is outstanding and the titanium build feels premium.',
    tags: ['premium', 'camera', 'fast'],
  },
  {
    productId: 1,
    userId: 2,
    userName: 'Jane Smith',
    userEmail: 'jane.smith@example.com',
    rating: 4,
    reviewText: 'Great phone but quite expensive. Battery life could be better.',
    tags: ['expensive', 'battery'],
  },
  {
    productId: 2,
    userId: 3,
    userName: 'Mike Johnson',
    userEmail: 'mike.johnson@example.com',
    rating: 5,
    reviewText: 'Best Android phone I\'ve ever used. The AI features are incredible!',
    tags: ['android', 'ai', 'best'],
  },
  {
    productId: 3,
    userId: 4,
    userName: 'Sarah Wilson',
    userEmail: 'sarah.wilson@example.com',
    rating: 5,
    reviewText: 'Perfect laptop for work and travel. Light weight and amazing performance.',
    tags: ['lightweight', 'performance', 'work'],
  },
  {
    productId: 4,
    userId: 1,
    userName: 'John Doe',
    userEmail: 'john.doe@example.com',
    rating: 4,
    reviewText: 'Excellent noise cancellation. Great for flights and commuting.',
    tags: ['noise-canceling', 'travel', 'commute'],
  },
];

async function seed() {
  // Insert users
  for (const user of usersData) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }

  // Insert products
  for (const product of productsData) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {},
      create: product,
    });
  }

  // Insert reviews
  for (const review of reviewsData) {
    await prisma.review.upsert({
      where: {
        unique_user_product: {
          userId: review.userId,
          productId: review.productId,
        },
      },
      update: {},
      create: review,
    });
  }

  // Update product rating and review tags
  for (const product of productsData) {
    const reviews = await prisma.review.findMany({
      where: { productId: product.id },
    });

    const ratings = reviews.map(r => r.rating).filter(Boolean);
    const avg = ratings.length
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      : 0;

    await prisma.product.update({
      where: { id: product.id },
      data: {
        averageRating: Math.round(avg * 10) / 10,
        totalReviews: reviews.length,
      },
    });

    for (const review of reviews) {
      if (Array.isArray(review.tags)) {
        for (const tag of review.tags) {
          await prisma.reviewTag.upsert({
            where: {
              unique_product_tag: {
                productId: product.id,
                tagName: tag.toLowerCase(),
              },
            },
            update: { count: { increment: 1 } },
            create: {
              productId: product.id,
              tagName: tag.toLowerCase(),
              count: 1,
            },
          });
        }
      }
    }
  }

  console.log('Seed complete.');
}

seed()
  .catch(err => {
    console.error('Error while seeding:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
