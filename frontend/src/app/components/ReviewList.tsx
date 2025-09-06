"use client";

import { Review } from "../lib/product-api";
import ReviewCard from "./ReviewCard";

type ReviewListProps = {
  reviews?: Review[];
};

export default function ReviewList({ reviews }: ReviewListProps) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="card-bg rounded-xl p-8 border border-gray-700 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <p className="text-gray-400 text-lg font-medium mb-1">No reviews yet</p>
            <p className="text-gray-500 text-sm">Be the first to share your experience!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="header-text text-xl font-bold">
          Customer Reviews ({reviews.length})
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex">
            {[...Array(5)].map((_, index) => (
              <span key={index} className="text-orange-400 text-lg">★</span>
            ))}
          </div>
          <span className="text-gray-400 text-sm">
            {reviews.length} review{reviews.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
      
      {reviews.map((review) => (
        <ReviewCard key={review._id} review={review} />
      ))}
    </div>
  );
}