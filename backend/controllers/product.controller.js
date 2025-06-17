// src/controllers/product.controller.js

import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const prisma = new PrismaClient();

// Get all products with pagination and filtering
const getAllProducts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sort, category, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (category) where.category = category;

    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
        ];
    }

    let orderBy = {};
    switch (sort) {
        case 'newest':
            orderBy = { createdAt: 'desc' };
            break;
        case 'oldest':
            orderBy = { createdAt: 'asc' };
            break;
        case 'highest_rating':
            orderBy = [{ averageRating: 'desc' }, { totalReviews: 'desc' }];
            break;
        case 'lowest_rating':
            orderBy = [{ averageRating: 'asc' }, { totalReviews: 'desc' }];
            break;
        default:
            orderBy = { createdAt: 'desc' };
    }

    const [total, products] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
            where,
            orderBy,
            skip,
            take: parseInt(limit),
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                category: true,
                imageUrl: true,
                averageRating: true,
                totalReviews: true,
                createdAt: true,
                updatedAt: true
            }
        })
    ]);

    const categories = await prisma.product.findMany({
        where: { category: { not: null } },
        select: { category: true },
        distinct: ['category'],
        orderBy: { category: 'asc' }
    });

    res.status(200).json(
        new ApiResponse(200, {
            products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
                hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
                hasPrev: parseInt(page) > 1
            },
            categories: categories.map(cat => cat.category),
            filters: { category, search, sort }
        }, "Products fetched successfully")
    );
});

// Get single product with reviews summary
const getProductById = asyncHandler(async (req, res) => {
    const productId = parseInt(req.params.id);
    const product = req.product;

    const ratingDistribution = await prisma.review.groupBy({
        by: ['rating'],
        where: { productId, rating: { not: null } },
        _count: { rating: true },
        orderBy: { rating: 'desc' }
    });

    const totalRatings = ratingDistribution.reduce((sum, item) => sum + item._count.rating, 0);
    const ratingDist = ratingDistribution.map(item => ({
        rating: item.rating,
        count: item._count.rating,
        percentage: totalRatings > 0 ? Math.round((item._count.rating * 100) / totalRatings * 10) / 10 : 0
    }));

    const topTags = await prisma.reviewTag.findMany({
        where: { productId },
        orderBy: { count: 'desc' },
        take: 10,
        select: { tagName: true, count: true }
    });

    const recentReviews = await prisma.review.findMany({
        where: { productId },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
            id: true,
            userName: true,
            rating: true,
            reviewText: true,
            photos: true,
            helpfulCount: true,
            createdAt: true
        }
    });

    let userReview = null;
    if (req.user) {
        userReview = await prisma.review.findUnique({
            where: {
                userId_productId: {
                    userId: req.user.id,
                    productId
                }
            },
            select: {
                id: true,
                rating: true,
                reviewText: true,
                photos: true,
                createdAt: true
            }
        });
    }

    res.status(200).json(
        new ApiResponse(200, {
            product,
            rating_distribution: ratingDist,
            top_tags: topTags,
            recent_reviews: recentReviews,
            user_review: userReview
        }, "Product details fetched successfully")
    );
});

// Create new product
const createProduct = asyncHandler(async (req, res) => {
    const { name, description, price, category, imageUrl } = req.body;

    if (!name || !description || !price || !category) {
        throw new ApiError(400, "Name, description, price, and category are required");
    }

    const product = await prisma.product.create({
        data: { name, description, price, category, imageUrl }
    });

    res.status(201).json(new ApiResponse(201, product, "Product created successfully"));
});

// Update product
const updateProduct = asyncHandler(async (req, res) => {
    const productId = parseInt(req.params.id);
    const updates = req.body;

    const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(cleanUpdates).length === 0) {
        throw new ApiError(400, "No fields to update provided");
    }

    const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: cleanUpdates
    });

    res.status(200).json(new ApiResponse(200, updatedProduct, "Product updated successfully"));
});

// Delete product
const deleteProduct = asyncHandler(async (req, res) => {
    const productId = parseInt(req.params.id);

    await prisma.product.delete({ where: { id: productId } });

    res.status(200).json(new ApiResponse(200, null, "Product deleted successfully"));
});

// Get detailed product statistics
const getProductStats = asyncHandler(async (req, res) => {
    const productId = parseInt(req.params.id);
    const product = req.product;

    const stats = await prisma.review.aggregate({
        where: { productId },
        _count: { id: true, rating: true, reviewText: true, photos: true },
        _avg: { rating: true },
        _min: { rating: true },
        _max: { rating: true },
        _sum: { helpfulCount: true }
    });

    const reviewsWithPhotos = await prisma.review.count({
        where: {
            productId,
            photos: { not: null }
        }
    });

    const ratingDistribution = await prisma.review.groupBy({
        by: ['rating'],
        where: { productId, rating: { not: null } },
        _count: { rating: true },
        orderBy: { rating: 'desc' }
    });

    const totalRatings = stats._count.rating;
    const ratingDist = ratingDistribution.map(item => ({
        rating: item.rating,
        count: item._count.rating,
        percentage: totalRatings > 0 ? Math.round((item._count.rating * 100) / totalRatings * 10) / 10 : 0
    }));

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyTrends = await prisma.$queryRaw`
        SELECT
            DATE_FORMAT(created_at, '%Y-%m') as month,
            COUNT(*) as review_count,
            AVG(CASE WHEN rating IS NOT NULL THEN rating END) as avg_rating
        FROM reviews
        WHERE product_id = ${productId}
          AND created_at >= ${twelveMonthsAgo}
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month DESC
        LIMIT 12
    `;

    const processedStats = {
        total_reviews: stats._count.id,
        total_ratings: stats._count.rating,
        total_written_reviews: stats._count.reviewText,
        reviews_with_photos: reviewsWithPhotos,
        average_rating: stats._avg.rating ? Number(stats._avg.rating.toFixed(1)) : null,
        min_rating: stats._min.rating,
        max_rating: stats._max.rating,
        total_helpful_votes: stats._sum.helpfulCount || 0
    };

    res.status(200).json(
        new ApiResponse(200, {
            product: {
                id: product.id,
                name: product.name
            },
            overall_stats: processedStats,
            rating_distribution: ratingDist,
            monthly_trends: monthlyTrends
        }, "Product statistics fetched successfully")
    );
});

export {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductStats
};
