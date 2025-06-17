import express from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import {
  addReview,
  getProductReviews,
  getAverageRating,
} from "../controllers/review.controller.js";

const router = express.Router();

router.post("/", authenticateToken, addReview);

router.get("/", getProductReviews);
router.get("/average", getAverageRating);

export default router;
