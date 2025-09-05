"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { fetchProductById, Product } from "../../lib/product-api";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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

    if (id) {
      loadProduct();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">Product not found</p>
          <button
            onClick={() => router.push("/products")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  // Calculate discounted price if discount exists
  const discountedPrice = product.discountPercent 
    ? product.initialPrice * (1 - product.discountPercent / 100)
    : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => router.push("/products")}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Products
        </button>

        <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="relative">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  width={600}
                  height={400}
                  className="w-full h-96 lg:h-full object-cover"
                />
              ) : (
                <div className="w-full h-96 lg:h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No image available</span>
                </div>
              )}

              {/* Discount Badge */}
              {product.discountPercent && (
                <span className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                  -{product.discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Product Details */}
            <div className="p-8">
              {/* Product Name */}
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                {product.name}
              </h1>

              {/* Price Section */}
              <div className="mb-6">
                {discountedPrice ? (
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-bold text-green-600">
                      Ksh {discountedPrice.toLocaleString()}
                    </span>
                    <span className="text-xl text-gray-400 line-through">
                      Ksh {product.initialPrice.toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-green-600">
                    Ksh {product.initialPrice.toLocaleString()}
                  </span>
                )}

                {discountedPrice && (
                  <p className="text-sm text-green-600 mt-2">
                    You save: Ksh {(product.initialPrice - discountedPrice).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Categories */}
              <div className="flex gap-3 mb-6">
                <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {product.category}
                </span>
                <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                  {product.niche}
                </span>
              </div>

              {/* Product Description */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Product Info */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Product Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Category:</span>
                    <span className="ml-2 text-gray-800 font-medium">{product.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Niche:</span>
                    <span className="ml-2 text-gray-800 font-medium">{product.niche}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Product ID:</span>
                    <span className="ml-2 text-gray-800 font-medium">{product._id}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}