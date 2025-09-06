"use client";

import { Review } from "../lib/product-api";

type ReviewCardProps = {
  review: Review;
};

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">{review.name || "Anonymous"}</h3>
        <span className="text-yellow-500">
          {"★".repeat(review.rating)}{" "}
          <span className="text-gray-400">
            {"★".repeat(5 - review.rating)}
          </span>
        </span>
      </div>
      <p className="text-gray-700 mb-2">{review.comment}</p>
      <small className="text-gray-400">
        {new Date(review.createdAt).toLocaleDateString()}
      </small>
    </div>
  );
}
