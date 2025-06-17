import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client';
import { ApiError } from './ApiError.js';
import { ApiResponse } from './ApiResponse.js';

const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    let statusCode = 500;
    let message = 'Something went wrong';

    // Handle ApiError instances
    if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;
        
        return res.status(statusCode).json({
            success: false,
            message: message,
            errors: err.errors,
            ...(process.env.NODE_ENV === 'development' && { 
                stack: err.stack 
            })
        });
    }

    // Handle Prisma known request errors
    if (err instanceof PrismaClientKnownRequestError) {
        switch (err.code) {
            case 'P2002':
                // Unique constraint violation
                const field = err.meta?.target?.[0] || 'field';
                message = `${field} already exists`;
                statusCode = 409;
                break;
            case 'P2003':
                // Foreign key constraint violation
                message = 'Referenced record does not exist';
                statusCode = 400;
                break;
            case 'P2025':
                // Record not found
                message = 'Record not found';
                statusCode = 404;
                break;
            case 'P2014':
                // Invalid ID
                message = 'Invalid ID provided';
                statusCode = 400;
                break;
            case 'P2016':
                // Query interpretation error
                message = 'Invalid query parameters';
                statusCode = 400;
                break;
            default:
                message = 'Database operation failed';
                statusCode = 500;
        }
    }

    // Handle Prisma validation errors
    if (err instanceof PrismaClientValidationError) {
        message = 'Invalid data provided';
        statusCode = 400;
    }

    // Handle Joi validation errors
    if (err.isJoi) {
        message = err.details[0].message;
        statusCode = 400;
    }

    // Handle Multer file upload errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        message = 'File size too large';
        statusCode = 400;
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        message = 'Unexpected file field';
        statusCode = 400;
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        message = 'Invalid token';
        statusCode = 401;
    }

    if (err.name === 'TokenExpiredError') {
        message = 'Token expired';
        statusCode = 401;
    }

    // Handle database connection errors
    if (err.code === 'ECONNREFUSED') {
        message = 'Database connection refused';
        statusCode = 503;
    }

    // Handle validation errors from express-validator
    if (err.type === 'validation') {
        message = 'Validation failed';
        statusCode = 400;
    }

    // Send error response
    res.status(statusCode).json({
        success: false,
        message: message,
        ...(process.env.NODE_ENV === 'development' && { 
            stack: err.stack,
            code: err.code,
            meta: err.meta 
        })
    });
};

export { errorHandler };