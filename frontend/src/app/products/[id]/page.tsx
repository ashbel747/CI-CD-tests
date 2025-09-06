"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { fetchProductById, Product } from "../../lib/product-api";
import ReviewList from "../../components/ReviewList";
import ReviewForm from "../../components/ReviewForm";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadProduct() {
    try {
      const data = await fetchProductById(id as string);
      setProduct(data);
    } catch (err) {
      console.error("Failed to fetch product:", err);
      setError("Product not found");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="text-foreground text-lg">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center card-bg rounded-xl p-8 border border-gray-700">
          <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-400 text-xl font-semibold mb-4">Product not found</p>
          <button
            onClick={() => router.push("/products")}
            className="custom-button px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const discountedPrice = product.discountPercent
    ? product.initialPrice * (1 - product.discountPercent / 100)
    : null;

  // Calculate average rating
  const averageRating = product.reviews && product.reviews.length > 0
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => router.push("/products")}
          className="mb-8 flex items-center text-orange-400 hover:text-orange-300 transition-colors duration-200 group"
        >
          <svg
            className="w-5 h-5 mr-2 transition-transform duration-200 group-hover:-translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Products
        </button>

        {/* Product Card */}
        <div className="card-bg rounded-2xl overflow-hidden shadow-2xl border border-gray-700 mb-8">
          {/* Product Image */}
          <div className="relative">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                width={800}
                height={400}
                className="w-full h-80 object-cover"
              />
            ) : (
              <div className="w-full h-80 bg-gray-800 flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-16 h-16 text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-500">No image available</span>
                </div>
              </div>
            )}

            {product.discountPercent && (
              <div className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg animate-pulse">
                -{product.discountPercent}% OFF
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="p-8">
            <div className="flex gap-3 mb-4">
              <span className="px-4 py-2 bg-orange-500/20 text-orange-400 rounded-full text-sm font-medium border border-orange-500/30">
                {product.category}
              </span>
              <span className="px-4 py-2 bg-gray-700 text-gray-300 rounded-full text-sm font-medium">
                {product.niche}
              </span>
            </div>

            <h1 className="header-text text-4xl font-bold mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            {averageRating > 0 && (
              <div className="flex items-center gap-3 mb-6">
                <div className="flex">
                  {[...Array(5)].map((_, index) => (
                    <span
                      key={index}
                      className={`text-lg ${
                        index < Math.round(averageRating) 
                          ? "text-orange-400" 
                          : "text-gray-600"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-gray-400 text-sm">
                  {averageRating.toFixed(1)} ({product.reviews?.length || 0} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="mb-8">
              {discountedPrice ? (
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-4xl font-bold text-green-400">
                    Ksh {discountedPrice.toLocaleString()}
                  </span>
                  <span className="text-xl text-gray-500 line-through">
                    Ksh {product.initialPrice.toLocaleString()}
                  </span>
                </div>
              ) : (
                <span className="text-4xl font-bold text-green-400">
                  Ksh {product.initialPrice.toLocaleString()}
                </span>
              )}

              {discountedPrice && (
                <p className="text-green-400 mt-2 font-medium">
                  You save: Ksh {(product.initialPrice - discountedPrice).toLocaleString()}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="header-text text-xl font-semibold mb-4">
                Description
              </h3>
              <p className="text-foreground leading-relaxed text-lg">
                {product.description}
              </p>
            </div>

            {/* Add to Cart Button */}
            <button className="custom-button w-full py-4 px-8 rounded-xl text-lg font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg">
              Add To Cart
            </button>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="space-y-6">
          <h2 className="header-text text-3xl font-bold">Reviews</h2>
          
          <ReviewForm
            productId={product._id}
            onReviewAdded={() => loadProduct()}
          />

          <ReviewList reviews={product.reviews || []} />
        </div>
      </div>
    </div>
  );
}