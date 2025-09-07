"use client";

import { useWishlist } from "@/app/context/WishlistContext";
import { addToCart } from "@/app/lib/cart-api";
import { isLoggedIn } from "@/app/lib/auth";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function WishlistPage() {
  const { wishlist, loading, toggleItem, refreshWishlist } = useWishlist();
  const router = useRouter();

  const handleAddToCart = async (productId: string) => {
    if (!isLoggedIn()) {
      toast.error("Please log in to add items to cart.");
      router.push("/login");
      return;
    }

    try {
      await addToCart(productId, 1);
      toast.success("Product added to cart!");
      // Optionally, you can also remove it from the wishlist after adding to cart
      // await toggleItem(productId);
    } catch (err) {
      console.error("Add to cart error:", err);
      toast.error("Failed to add to cart.");
    }
  };

  const handleRemove = async (productId: string) => {
    await toggleItem(productId);
  };

  if (loading) {
    return <p className="text-center mt-20">Loading wishlist...</p>;
  }

  if (wishlist.length === 0) {
    return (
      <div className="text-center mt-20">
        <p className="text-xl mb-4">Your wishlist is empty.</p>
        <button
          onClick={() => router.push("/products")}
          className="custom-button px-6 py-3 rounded-lg"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
      <div className="space-y-6">
        {wishlist.map((product) => (
          <div
            key={product._id}
            className="flex flex-col md:flex-row items-center gap-4 p-4 border border-gray-700 rounded-lg"
          >
            <Link href={`/products/${product._id}`} className="flex-shrink-0">
              <Image
                src={product.image || "/placeholder.png"}
                alt={product.name}
                width={120}
                height={120}
                className="object-cover rounded-lg"
              />
            </Link>
            <div className="flex-1 text-center md:text-left">
              <Link href={`/products/${product._id}`}>
                <h2 className="text-xl font-semibold">{product.name}</h2>
              </Link>
              <p className="text-gray-400">
                {product.category} • {product.niche}
              </p>
              <p className="text-green-400 font-bold mt-1">
                Ksh {product.discountedPrice ?? product.initialPrice}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
              <button
                onClick={() => handleAddToCart(product._id)}
                className="custom-button px-4 py-2 rounded-lg"
              >
                Add to Cart
              </button>
              <button
                onClick={() => handleRemove(product._id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}