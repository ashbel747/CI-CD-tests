"use client";

import { apiCall, isLoggedIn } from "./auth";
import { Product } from "./product-api"; // Assuming Product type is defined here
import toast from 'react-hot-toast';

// Define the type for a wishlist item (just the product)
export type WishlistItem = Product;

// Helper function to check authentication before wishlist operations
const requireAuth = (): void => {
  if (!isLoggedIn()) {
    toast.error("Please log in to manage your wishlist.");
    throw new Error("AUTHENTICATION_REQUIRED");
  }
};

// Fetch all items in the wishlist
export const fetchWishlist = async (): Promise<WishlistItem[]> => {
  requireAuth();
  
  try {
    const response = await apiCall('/wishlist');

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch wishlist: ${response.status} ${error}`);
    }

    return response.json();
  } catch (err: any) {
    if (err.message === "AUTHENTICATION_REQUIRED") {
      throw err; // Re-throw to be handled by the component
    }
    console.error("Failed to fetch wishlist:", err);
    throw new Error("Failed to fetch wishlist. Please try again.");
  }
};

// Toggle a product in the wishlist (add or remove)
export const toggleWishlist = async (productId: string): Promise<WishlistItem[]> => {
  requireAuth();

  try {
    const response = await apiCall(`/wishlist/${productId}`, {
      method: "POST",
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to toggle wishlist item: ${response.status} ${error}`);
    }

    return response.json();
  } catch (err: any) {
    if (err.message === "AUTHENTICATION_REQUIRED") {
      throw err; // Re-throw
    }
    console.error("Failed to toggle wishlist item:", err);
    throw new Error("Failed to update wishlist. Please try again.");
  }
};