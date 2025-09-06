"use client";

import { Review } from "../lib/product-api";
import ReviewCard from "./ReviewCard";

type ReviewListProps = {
  reviews?: Review[];
};

export default function ReviewList({ reviews }: ReviewListProps) {
  if (!reviews || reviews.length === 0) {
    return <p className="text-gray-500">No reviews yet. Be the first to add one!</p>;
  }

  return (
    <div className="space-y-4 mt-4">
      {reviews.map((review) => (
        <ReviewCard key={review._id} review={review} />
      ))}
    </div>
  );
}
