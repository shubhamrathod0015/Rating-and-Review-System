import express from 'express';

import { setupMiddleware } from './middleware/index.middleware.js';
import { addReview } from './controllers/review.controller.js';
import errorHandler from './middleware/errorHandler.middleware.js';

const app = express();

// Setup middleware
setupMiddleware(app);

// Routes
app.use('/api/reviews', addReview);

// Error handling middleware
app.use(errorHandler);

export default app;
