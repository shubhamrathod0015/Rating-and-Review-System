import express from 'express';

import { setupMiddleware } from './middleware/index.middleware.js';
import { addReview } from './controllers/review.controller.js';
import errorHandler from './middleware/errorHandler.middleware.js';
import productRoutes from './routes/product.routes.js';


const app = express();

// Setup middleware
setupMiddleware(app);

// Routes
app.use('/api/reviews', addReview);
app.use('/api/products', productRoutes);

// Error handling middleware
app.use(errorHandler);

export default app;
