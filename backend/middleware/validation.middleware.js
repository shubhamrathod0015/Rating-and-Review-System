// src/middleware/validation.middleware.js

import Joi from 'joi';
import { PrismaClient } from '@prisma/client';
import { ApiError } from '../utils/ApiError.js';



const prisma = new PrismaClient();

// Validation schemas
const schemas = {
    createUser: Joi.object({
        name: Joi.string().min(2).max(255).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).optional()
    }),

    loginUser: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    }),

    updateUser: Joi.object({
        name: Joi.string().min(2).max(255).optional(),
        email: Joi.string().email().optional(),
        currentPassword: Joi.string().optional(),
        newPassword: Joi.string().min(6).optional()
    }),

    createReview: Joi.object({
        product_id: Joi.number().integer().positive().required(),
        user_name: Joi.string().min(2).max(255).required(),
        user_email: Joi.string().email().required(),
        rating: Joi.number().integer().min(1).max(5).optional(),
        review_text: Joi.string().max(2000).allow('').optional(),
        tags: Joi.alternatives().try(
            Joi.array().items(Joi.string().max(50)).max(10),
            Joi.string().custom((value, helpers) => {
                try {
                    const parsed = JSON.parse(value);
                    if (!Array.isArray(parsed) || !parsed.every(item => typeof item === 'string' && item.length <= 50)) {
                        throw new Error('Tags must be an array of strings, each max 50 characters.');
                    }
                    return parsed;
                } catch (error) {
                    return helpers.error('any.custom', { message: 'Invalid JSON format or content for tags' });
                }
            })
        ).optional()
    }).or('rating', 'review_text'),

    updateReview: Joi.object({
        rating: Joi.number().integer().min(1).max(5).optional(),
        review_text: Joi.string().max(2000).optional(),
        tags: Joi.array().items(Joi.string().max(50)).max(10).optional()
    }),

    createProduct: Joi.object({
        name: Joi.string().min(2).max(255).required(),
        description: Joi.string().max(2000).optional(),
        price: Joi.number().positive().precision(2).optional(),
        category: Joi.string().max(100).optional(),
        imageUrl: Joi.string().uri().max(500).optional()
    }),

    updateProduct: Joi.object({
        name: Joi.string().min(2).max(255).optional(),
        description: Joi.string().max(2000).optional(),
        price: Joi.number().positive().precision(2).optional(),
        category: Joi.string().max(100).optional(),
        imageUrl: Joi.string().uri().max(500).optional()
    }),

    paginationQuery: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        sort: Joi.string().valid('newest', 'oldest', 'highest_rating', 'lowest_rating').default('newest'),
        category: Joi.string().max(100).optional(),
        search: Joi.string().max(255).optional()
    }),

    reviewQuery: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(50).default(10),
        sort: Joi.string().valid('newest', 'oldest', 'highest_rating', 'lowest_rating', 'most_helpful').default('newest'),
        rating: Joi.number().integer().min(1).max(5).optional()
    })
};

// Validation middleware factory
const validate = (schemaName, source = 'body') => {
    return (req, res, next) => {
        const schema = schemas[schemaName];
        if (!schema) {
            throw new ApiError(500, `Validation schema '${schemaName}' not found.`);
        }

        const data = source === 'query' ? req.query : req.body;
        const { error, value } = schema.validate(data, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errorMessages = error.details.map(detail => detail.message);
            throw new ApiError(400, "Validation failed", errorMessages);
        }

        if (source === 'query') {
            req.query = value;
        } else {
            req.body = value;
        }

        next();
    };
};

// Custom validation middleware for product existence
const validateProductExists = async (req, res, next) => {
    try {
        const productId = parseInt(req.params.id || req.params.productId || req.body.product_id);
        if (isNaN(productId)) {
            throw new ApiError(400, 'Valid product ID is required');
        }

        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            throw new ApiError(404, 'Product not found');
        }

        req.product = product;
        next();
    } catch (error) {
        next(error);
    }
};

const validateUserExists = async (req, res, next) => {
    try {
        const userId = parseInt(req.params.userId || req.body.user_id);
        if (isNaN(userId)) {
            throw new ApiError(400, 'Valid user ID is required');
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        req.targetUser = user;
        next();
    } catch (error) {
        next(error);
    }
};

const validateReviewExists = async (req, res, next) => {
    try {
        const reviewId = parseInt(req.params.id);
        if (isNaN(reviewId)) {
            throw new ApiError(400, 'Valid review ID is required');
        }

        const review = await prisma.review.findUnique({
            where: { id: reviewId },
            include: {
                product: true,
                user: true
            }
        });

        if (!review) {
            throw new ApiError(404, 'Review not found');
        }

        req.review = review;
        next();
    } catch (error) {
        next(error);
    }
};

export {
    validate,
    validateProductExists,
    validateUserExists,
    validateReviewExists,
    schemas
};
