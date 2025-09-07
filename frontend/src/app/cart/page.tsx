"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  fetchCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  checkoutCart,
  CartItem,
} from "../lib/cart-api";

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingProductId, setUpdatingProductId] = useState<string | null>(null);
  const router = useRouter();

  // Fetch cart from backend
  async function loadCart() {
    try {
      setLoading(true);
      const data = await fetchCart();
      console.log("Cart data:", data); // Debug log
      setCartItems(Array.isArray(data) ? data : []); // Ensure it's always an array
    } catch (err) {
      console.error("Failed to fetch cart:", err);
      setCartItems([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  // Remove item (using productId, not cart item ID)
  const handleRemove = async (productId: string) => {
    try {
      setUpdatingProductId(productId);
      const updatedCart = await removeFromCart(productId);
      setCartItems(Array.isArray(updatedCart) ? updatedCart : []);
    } catch (err) {
      console.error(err);
      alert("Failed to remove item");
    } finally {
      setUpdatingProductId(null);
    }
  };

  // Increase quantity (using productId, not cart item ID)
  const handleIncrease = async (productId: string, currentQty: number) => {
    try {
      setUpdatingProductId(productId);
      const updatedCart = await updateCartItem(productId, currentQty + 1);
      setCartItems(Array.isArray(updatedCart) ? updatedCart : []);
    } catch (err) {
      console.error(err);
      alert("Failed to update quantity");
    } finally {
      setUpdatingProductId(null);
    }
  };

  // Decrease quantity (using productId, not cart item ID)
  const handleDecrease = async (productId: string, currentQty: number) => {
    if (currentQty <= 1) return; // Don't allow 0 quantity
    try {
      setUpdatingProductId(productId);
      const updatedCart = await updateCartItem(productId, currentQty - 1);
      setCartItems(Array.isArray(updatedCart) ? updatedCart : []);
    } catch (err) {
      console.error(err);
      alert("Failed to update quantity");
    } finally {
      setUpdatingProductId(null);
    }
  };

  // Checkout
  const handleCheckout = async () => {
    try {
      const emptiedCart = await checkoutCart();
      setCartItems(Array.isArray(emptiedCart) ? emptiedCart : []);
      alert("Checkout successful!");
    } catch (err) {
      console.error(err);
      alert("Failed to checkout");
    }
  };

  // Calculate total price - with error protection
  const totalPrice = Array.isArray(cartItems) ? cartItems.reduce((sum, item) => {
    const product = item.productId;
    if (!product) return sum;
    
    const price = product.discountedPrice ?? product.initialPrice ?? 0;
    return sum + price * item.quantity;
  }, 0) : 0;

  if (loading) {
    return <p className="text-center mt-20">Loading cart...</p>;
  }

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return (
      <div className="text-center mt-20">
        <p className="text-xl mb-4">Your cart is empty.</p>
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
      <h1 className="text-3xl font-bold mb-8">My Cart</h1>
      <div className="space-y-6">
        {cartItems.map(item => {
          const product = item.productId;
          
          if (!product) {
            console.error("No product data found for cart item:", item);
            return null;
          }

          const price = product.discountedPrice ?? product.initialPrice ?? 0;
          const itemTotal = price * item.quantity;
          const isUpdating = updatingProductId === product._id;

          return (
            <div
              key={item._id}
              className="flex items-center gap-4 border-b border-gray-700 pb-4"
            >
              <Image
                src={product.image ?? "/placeholder.png"}
                alt={product.name || "Product"}
                width={120}
                height={120}
                className="object-cover rounded-lg"
              />
              <div className="flex-1">
                <h2 className="text-xl font-semibold">{product.name}</h2>
                <p className="text-gray-400">
                  {product.category} • {product.niche}
                </p>
                <p className="text-green-400 font-bold mt-1">
                  Ksh {price.toLocaleString()} x {item.quantity} = Ksh {itemTotal.toLocaleString()}
                </p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleDecrease(product._id, item.quantity)}
                    disabled={isUpdating}
                    className="px-3 py-1 bg-gray-700 text-white rounded-lg disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 border rounded-lg">{item.quantity}</span>
                  <button
                    onClick={() => handleIncrease(product._id, item.quantity)}
                    disabled={isUpdating}
                    className="px-3 py-1 bg-gray-700 text-white rounded-lg disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                onClick={() => handleRemove(product._id)}
                disabled={isUpdating}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 disabled:opacity-50"
              >
                {isUpdating ? "Updating..." : "Remove"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Total: Ksh {totalPrice.toLocaleString()}</h2>
        <button
          onClick={handleCheckout}
          className="custom-button px-6 py-3 rounded-lg"
        >
          Checkout
        </button>
      </div>
    </div>
  );
}