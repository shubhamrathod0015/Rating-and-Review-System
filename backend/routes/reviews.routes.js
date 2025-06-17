import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import {
  addReview,
  getProductReviews,
  getAverageRating
} from '../controllers/review.controller.js';

const router = express.Router();

// Protected route
router.post('/', authenticateToken, addReview);

// Public routes
router.get('/', getProductReviews);
router.get('/average', getAverageRating);

export default router;
