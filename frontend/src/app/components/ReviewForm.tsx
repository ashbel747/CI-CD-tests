"use client";

import { useState } from "react";
import { addReview } from "../lib/product-api";

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
      onReviewAdded({ comment, rating }); // notify parent
    } catch (err: any) {
      setError(err.message || "Failed to add review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 bg-gray-50 p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">Add a Review</h3>

      {error && <p className="text-red-600 mb-2">{error}</p>}

      <textarea
        className="w-full border rounded p-2 mb-3"
        placeholder="Write your comment..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        required
      />

      <div className="mb-3">
        <label className="mr-2 font-medium">Rating:</label>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="border rounded p-1"
        >
          {[1, 2, 3, 4, 5].map((r) => (
            <option key={r} value={r}>
              {r} Star{r > 1 ? "s" : ""}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
