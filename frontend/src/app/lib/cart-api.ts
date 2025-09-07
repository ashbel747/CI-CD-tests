import {isLoggedIn,apiCall} from './auth'

export type CartItem = {
  productId: {        // Product object (populated)
    _id: string;
    name: string;
    initialPrice: number;
    discountedPrice?: number;
    image?: string;
    category?: string;
    niche?: string;
  };
  quantity: number;
};

// Helper function to check authentication before cart operations
const requireAuth = (): void => {
  if (!isLoggedIn()) {
    throw new Error("AUTHENTICATION_REQUIRED");
  }
};

// -------------------- Cart API Functions --------------------

// Fetch all items in the cart
export const fetchCart = async (): Promise<CartItem[]> => {
  requireAuth();
  
  const response = await apiCall('/cart');

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch cart: ${response.status} ${error}`);
  }

  return response.json();
};

// Add a product to the cart
export const addToCart = async (productId: string, quantity: number = 1): Promise<CartItem[]> => {
  requireAuth();

  const response = await apiCall('/cart', {
    method: "POST",
    body: JSON.stringify({ productId, quantity }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to add to cart: ${response.status} ${error}`);
  }

  return response.json();
};

// Remove an item from the cart (set quantity to 0)
export const removeFromCart = async (productId: string): Promise<CartItem[]> => {
  requireAuth();

  const response = await apiCall('/cart', {
    method: "PUT",
    body: JSON.stringify({ productId, quantity: 0 }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to remove item: ${response.status} ${error}`);
  }

  return response.json();
};

// Update the quantity of a cart item
export const updateCartItem = async (productId: string, quantity: number): Promise<CartItem[]> => {
  requireAuth();

  const response = await apiCall('/cart', {
    method: "PUT",
    body: JSON.stringify({ productId, quantity }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update cart item: ${response.status} ${error}`);
  }

  return response.json();
};

// Checkout cart (clears cart)
export const checkoutCart = async (): Promise<{ message: string }> => {
  requireAuth();

  const response = await apiCall('/cart/checkout', {
    method: "POST",
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to checkout: ${response.status} ${error}`);
  }

  return response.json();
};