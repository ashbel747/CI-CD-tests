"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/app/lib/product-api";
import { useWishlist } from "@/app/context/WishlistContext";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";

const ProductCard = ({ product }: { product: Product }) => {
  const { isWishlisted, toggleItem, loading } = useWishlist();

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevents navigating to the product page
    e.stopPropagation(); // Stops event from bubbling up to the link
    toggleItem(product._id);
  };

  const discountedPrice: number | string = product.discountPercent
    ? (
        product.initialPrice *
        (1 - product.discountPercent / 100)
      ).toFixed(0)
    : product.initialPrice;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl overflow-hidden hover:shadow-lg transition cursor-pointer relative">
      <Link href={`/products/${product._id}`}>
        <div className="relative">
          <Image
            src={product.image || "/placeholder.png"}
            alt={product.name}
            width={500}
            height={200}
            className="h-48 w-full object-cover"
          />
          {product.discountPercent && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded shadow-md">
              -{product.discountPercent}%
            </span>
          )}
          {/* Wishlist Button */}
          <button
            onClick={handleToggle}
            className="absolute top-2 left-2 p-2 rounded-full bg-white dark:bg-gray-900 shadow-lg text-gray-500 hover:text-red-500 transition disabled:opacity-50"
            disabled={loading}
          >
            {isWishlisted(product._id) ? (
              <HeartIconSolid className="h-6 w-6 text-red-500" />
            ) : (
              <HeartIcon className="h-6 w-6" />
            )}
          </button>
        </div>

        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            {product.name}
          </h2>

          <div className="flex items-center gap-2 mb-3">
            {product.discountPercent ? (
              <>
                <span className="text-gray-400 line-through">
                  Ksh {product.initialPrice}
                </span>
                <span className="text-green-600 font-bold">
                  Ksh {discountedPrice}
                </span>
              </>
            ) : (
              <span className="text-green-600 font-bold">
                Ksh {product.initialPrice}
              </span>
            )}
          </div>

          <div className="flex justify-between text-sm text-gray-500">
            <span className="px-2 py-1 bg-gray-100 rounded-lg">
              {product.niche}
            </span>
            <span className="px-2 py-1 bg-gray-100 rounded-lg">
              {product.category}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;