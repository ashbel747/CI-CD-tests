"use client";

import { Review } from "../lib/product-api";

type ReviewCardProps = {
  review: Review;
};

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="card-bg rounded-xl p-6 shadow-lg border border-gray-700 mb-4 transition-all duration-200 hover:shadow-xl">
      <div className="flex justify-between items-start mb-4">
        <h3 className="header-text font-semibold text-lg">
          {review.name || "Anonymous"}
        </h3>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, index) => (
            <span
              key={index}
              className={`text-lg ${
                index < review.rating 
                  ? "text-orange-400" 
                  : "text-gray-600"
              }`}
            >
              ★
            </span>
          ))}
        </div>
      </div>
      
      <p className="text-foreground leading-relaxed mb-4 text-base">
        {review.comment}
      </p>
      
      <div className="flex justify-end">
        <small className="text-gray-400 text-sm">
          {new Date(review.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </small>
      </div>
    </div>
  );
}