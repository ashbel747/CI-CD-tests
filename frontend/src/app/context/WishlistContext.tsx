"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchWishlist, toggleWishlist, WishlistItem } from '../lib/wishlist-api';
import { isLoggedIn } from '../lib/auth';
import toast from 'react-hot-toast';

// Define the context type
interface WishlistContextType {
  wishlist: WishlistItem[];
  loading: boolean;
  toggleItem: (productId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
  refreshWishlist: () => void;
}

// Create the context
const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// Create the provider component
export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadWishlist = async () => {
    if (!isLoggedIn()) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const items = await fetchWishlist();
      setWishlist(items);
    } catch (err) {
      console.error("Failed to load wishlist:", err);
      // We don't show a toast for this, as it's a passive fetch
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const toggleItem = async (productId: string) => {
    try {
      const updatedWishlist = await toggleWishlist(productId);
      setWishlist(updatedWishlist);
      
      const isNowWishlisted = updatedWishlist.some(item => item._id === productId);
      toast.success(isNowWishlisted ? "Added to wishlist!" : "Removed from wishlist!");

    } catch (err: any) {
      if (err.message === "AUTHENTICATION_REQUIRED") {
        // The wishlist-api.ts handles the toast and redirect for this case.
      } else {
        toast.error("Failed to update wishlist.");
        console.error("Wishlist toggle error:", err);
      }
    }
  };

  const isWishlisted = (productId: string): boolean => {
    return wishlist.some(item => item._id === productId);
  };
  
  const value = { wishlist, loading, toggleItem, isWishlisted, refreshWishlist: loadWishlist };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

// Create a custom hook for easy access
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};