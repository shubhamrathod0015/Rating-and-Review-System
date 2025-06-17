import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getProducts = asyncHandler(async (req, res) => {
  try {
    const products = await prisma.product.findMany();

    const formattedProducts = products.map((product) => ({
      ...product,
      price: parseFloat(product.price),
      averageRating: parseFloat(product.averageRating),
      totalReviews: parseInt(product.totalReviews, 10),
    }));

    res
      .status(200)
      .json(
        new ApiResponse(200, formattedProducts, "Products fetched successfully")
      );
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new ApiError(500, "Failed to fetch products");
  }
});

export { getProducts };
