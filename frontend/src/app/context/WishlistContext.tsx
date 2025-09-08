'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './authContext';
import { apiCall } from '../lib/auth';

// Define the type for a product
interface Product {
  _id: string; // Use _id to match your old wishlist page
  name: string;
  price: number;
  category: string;
  niche: string;
  image: string;
  discountedPrice?: number;
  initialPrice?: number;
}

// Define the shape of a wishlist item (just the product)
export type WishlistItem = Product;

// Define the shape of the context's value
interface WishlistContextType {
  wishlist: WishlistItem[];
  loading: boolean;
  toggleWishlist: (productId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined,
);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch the wishlist
  const fetchWishlist = async () => {
    if (!user) {
      setWishlist([]); // Clear wishlist if user is logged out
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // apiCall returns the parsed JSON directly, not a Response object
      const data = await apiCall('/wishlist');
      setWishlist(data);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      toast.error('Failed to load wishlist. Please try again.');
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch wishlist whenever the user or auth state changes
  useEffect(() => {
    if (!authLoading) {
      fetchWishlist();
    }
  }, [user, authLoading]);

  // Toggle a product in the wishlist (add or remove)
  const toggleWishlist = async (productId: string) => {
    if (!user) {
      toast.error('Please log in to manage your wishlist.');
      return;
    }

    setLoading(true);
    try {
      // apiCall returns the parsed JSON directly, not a Response object
      const updatedWishlist = await apiCall(`/wishlist/${productId}`, {
        method: 'POST',
      });
      setWishlist(updatedWishlist);
      toast.success(
        isWishlisted(productId)
          ? 'Item removed from wishlist.'
          : 'Item added to wishlist!',
      );
    } catch (error) {
      console.error('Failed to toggle wishlist item:', error);
      toast.error('Failed to update wishlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isWishlisted = (productId: string) => {
    return wishlist.some((item) => item._id === productId);
  };

  const value = {
    wishlist,
    loading,
    toggleWishlist,
    isWishlisted,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};