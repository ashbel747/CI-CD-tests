"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { fetchProductById, Product } from "../../lib/product-api";
import ReviewList from "../../components/ReviewList";
import ReviewForm from "../../components/ReviewForm";
import toast from "react-hot-toast";
import { addToCart } from "../../lib/cart-api";
import { isLoggedIn } from "../../lib/auth";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);

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

  const handleAddToCart = async () => {
    if (!product) return;

    // Check if user is logged in
    if (!isLoggedIn()) {
      toast.error("Please log in to add items to cart");
      router.push("/login"); // Adjust path to your login page
      return;
    }

    try {
      setAddingToCart(true);
      await addToCart(product._id, 1);
      toast.success(`${product.name} added to cart!`);
    } catch (err: any) {
      console.error("Add to cart error:", err);
      
      // Handle specific error types
      if (err.message === "AUTHENTICATION_REQUIRED") {
        toast.error("Please log in to add items to cart");
        router.push("/login");
      } else if (err.message.includes("401") || err.message.includes("Unauthorized")) {
        toast.error("Your session has expired. Please log in again.");
        router.push("/login");
      } else {
        toast.error("Failed to add product to cart. Please try again.");
      }
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) return <p className="text-center mt-20">Loading product...</p>;
  
  if (error || !product)
    return (
      <div className="text-center mt-20">
        <p className="text-red-500">{error || "Product not found"}</p>
        <button onClick={() => router.push("/products")} className="custom-button px-6 py-3 rounded-lg mt-4">
          Back to Products
        </button>
      </div>
    );

  const discountedPrice = product.discountPercent
    ? product.initialPrice * (1 - product.discountPercent / 100)
    : null;

  const userLoggedIn = isLoggedIn();

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button onClick={() => router.push("/products")} className="mb-8 text-orange-400 hover:text-orange-300">
          ← Back to Products
        </button>

        <div className="card-bg rounded-2xl overflow-hidden shadow-2xl border border-gray-700 mb-8">
          {product.image && (
            <Image src={product.image} alt={product.name} width={800} height={400} className="w-full h-80 object-cover" />
          )}
          {product.discountPercent && (
            <div className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg animate-pulse">
              -{product.discountPercent}% OFF
            </div>
          )}
          <div className="p-8">
            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
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
                <span className="text-4xl font-bold text-green-400">Ksh {product.initialPrice.toLocaleString()}</span>
              )}
            </div>
            
            {/* Add to Cart Button */}
            {userLoggedIn ? (
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="custom-button w-full py-4 px-8 rounded-xl text-lg font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingToCart ? "Adding to Cart..." : "Add To Cart"}
              </button>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="custom-button w-full py-4 px-8 rounded-xl text-lg font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                Login to Add to Cart
              </button>
            )}
          </div>
        </div>

        {/* Reviews Section - Only show for logged-in users */}
        {userLoggedIn && (
          <>
            <ReviewForm productId={product._id} onReviewAdded={() => loadProduct()} />
            <ReviewList reviews={product.reviews || []} />
          </>
        )}
        
        {/* Show login prompt for reviews if not logged in */}
        {!userLoggedIn && (
          <div className="text-center py-8 card-bg rounded-xl border border-gray-700">
            <p className="text-gray-400 mb-4">Login to see reviews and add your own!</p>
            <button
              onClick={() => router.push("/login")}
              className="custom-button px-6 py-2 rounded-lg"
            >
              Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}