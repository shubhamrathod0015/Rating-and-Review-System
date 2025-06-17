import React, { useState, useEffect } from "react";
import StarRating from "../ui/StarRating";
import { createReview } from "../../services/productService";
import { useNavigate } from "react-router-dom";

const ProductReviewForm = ({ product, onSubmit, onClose }) => {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ratingError, setRatingError] = useState("");
  const [formError, setFormError] = useState("");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem("token");
    setShowLoginPrompt(!token);
  }, []);

  const handleRatingChange = (newRating) => {
    setRating(newRating);
    if (newRating > 0 && ratingError) {
      setRatingError("");
    }
  };

  const handleLoginRedirect = () => {
    onClose();
    navigate("/login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setRatingError("");
    setFormError("");

    const token = localStorage.getItem("token");
    if (!token) {
      setShowLoginPrompt(true);
      return;
    }

    if (rating === 0) {
      setRatingError("Please select a rating");
      return;
    }

    setIsSubmitting(true);

    try {
      await createReview({
        productId: product.id,
        rating,
        comment,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
      });

      onSubmit();
      onClose();
    } catch (err) {
      if (err.response?.status === 401) {
        setFormError("Your session has expired. Please log in again.");
        setShowLoginPrompt(true);
      } else {
        setFormError(
          err.message ||
            err.response?.data?.message ||
            "Failed to submit review. Please try again later."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-xl max-w-md w-full animate-popIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Review {product.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {showLoginPrompt ? (
          <div className="p-6 text-center">
            <div className="text-lg font-medium mb-4">
              You need to be logged in to submit a review
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLoginRedirect}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Log In
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            {formError && (
              <div className="bg-red-50 text-red-700 p-3 rounded mb-4">
                {formError}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Your Rating *</label>
              <StarRating
                rating={rating}
                interactive={true}
                onRate={handleRatingChange}
                size="lg"
              />
              {ratingError && (
                <p className="text-red-500 text-sm mt-1">{ratingError}</p>
              )}
            </div>

            <div className="mb-6">
              <label htmlFor="comment" className="block text-gray-700 mb-2">
                Your Review
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors min-h-[120px]"
                placeholder="Share your experience with this product..."
                rows="4"
              ></textarea>
            </div>

            <div className="mb-6">
              <label htmlFor="tags" className="block text-gray-700 mb-2">
                Tags (comma separated)
                <span className="text-gray-400 text-sm ml-1">Optional</span>
              </label>
              <input
                type="text"
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                placeholder="e.g., durable, comfortable, stylish"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  "Submit Review"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProductReviewForm;
