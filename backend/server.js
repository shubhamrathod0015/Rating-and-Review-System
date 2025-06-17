// app.js
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables

import express from 'express';
import productRoutes from './routes/products.routes.js';
import { PrismaClient } from '@prisma/client';
import { ApiError } from './utils/ApiError.js';
import { ApiResponse } from './utils/ApiResponse.js';

const app = express();
const prisma = new PrismaClient();

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to attach Prisma client to request object (optional)
app.use((req, res, next) => {
    req.prisma = prisma;
    next();
});

// Product routes
app.use('/api/products', productRoutes);

// Generic error handling middleware
app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json(
            new ApiResponse(err.statusCode, null, err.message, err.errors)
        );
    }

    console.error(err); // Log the error
    res.status(500).json(new ApiResponse(500, null, "Internal Server Error"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
