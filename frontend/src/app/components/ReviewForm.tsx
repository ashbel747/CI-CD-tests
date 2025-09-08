"use client";

import { useState } from "react";
import { addReview } from "../lib/product-api-client";

type ReviewFormProps = {
  productId: string;
  onReviewAdded: (review: { comment: string; rating: number }) => void;
};

export default function ReviewForm({ productId, onReviewAdded }: ReviewFormProps) {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updatedProduct = await addReview(productId, { comment, rating });
      setComment("");
      setRating(5);
      onReviewAdded({ comment, rating });
    } catch (err: any) {
      setError(err.message || "Failed to add review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-bg rounded-xl p-6 shadow-lg border border-gray-700 mb-8">
      <h3 className="header-text text-xl font-bold mb-6">Add Your Review</h3>
      
      {error && (
        <div className="bg-red-900/20 border border-red-700 text-red-400 rounded-lg p-3 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label-text block text-sm font-medium mb-2">
            Your Review
          </label>
          <textarea
            className="input-field w-full rounded-lg p-4 border focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none transition-all duration-200"
            placeholder="Share your experience with this product..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            required
          />
        </div>

        <div>
          <label className="label-text block text-sm font-medium mb-3">
            Rating
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-2xl transition-colors duration-200 ${
                  star <= rating ? "text-orange-400" : "text-gray-600"
                } hover:text-orange-300`}
              >
                ★
              </button>
            ))}
            <span className="label-text ml-3 text-sm">
              {rating} star{rating !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="custom-button w-full py-4 px-6 rounded-lg font-semibold text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Submitting...
            </span>
          ) : (
            "Submit Review"
          )}
        </button>
      </form>
    </div>
  );
}