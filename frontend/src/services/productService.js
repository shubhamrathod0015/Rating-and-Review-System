import api from "./api";

export const getProducts = async () => {
  try {
    const response = await api.get("/products");
    return response;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const getProductReviews = async (productId) => {
  try {
    const response = await api.get(`/reviews?productId=${productId}`);
    return response;
  } catch (error) {
    console.error(`Error fetching reviews for product ${productId}:`, error);
    throw error;
  }
};

export const createReview = async (reviewData) => {
  try {
    const response = await api.post("/reviews", reviewData);
    return response;
  } catch (error) {
    console.error("Error creating review:", error);
    throw error;
  }
};
