import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addReview = asyncHandler(async (req, res) => {
  const { productId, rating, comment } = req.body;
  const userId = req.user.id;

  if (!productId || !rating) {
    throw new ApiError(400, "Product ID and rating are required");
  }

  if (rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be between 1 and 5");
  }

  const productExists = await prisma.product.findUnique({
    where: { id: parseInt(productId) },
  });

  if (!productExists) {
    throw new ApiError(404, "Product not found");
  }

  const review = await prisma.review.create({
    data: {
      rating: parseInt(rating),
      comment: comment || null,
      userId: userId,
      productId: parseInt(productId),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  res
    .status(201)
    .json(new ApiResponse(201, review, "Review added successfully"));
});

const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.query;

  if (!productId) {
    throw new ApiError(400, "Product ID is required");
  }

  const reviews = await prisma.review.findMany({
    where: { productId: parseInt(productId) },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  res
    .status(200)
    .json(new ApiResponse(200, reviews, "Reviews fetched successfully"));
});

const getAverageRating = asyncHandler(async (req, res) => {
  const { productId } = req.query;

  if (!productId) {
    throw new ApiError(400, "Product ID is required");
  }

  const result = await prisma.review.aggregate({
    where: { productId: parseInt(productId) },
    _avg: {
      rating: true,
    },
    _count: {
      rating: true,
    },
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        averageRating: result._avg.rating || 0,
        totalReviews: result._count.rating,
      },
      "Average rating calculated successfully"
    )
  );
});

export { addReview, getProductReviews, getAverageRating };
