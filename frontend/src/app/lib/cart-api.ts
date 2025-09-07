// app/lib/cart-api.ts

export type CartItem = {
  _id: string;        // Cart item ID in user's cart
  productId: {        // Product object (populated)
    _id: string;
    name: string;
    initialPrice: number;
    discountedPrice?: number;
    image?: string;
    category?: string;
    niche?: string;
  };
  quantity: number;   // Quantity of this product
};

// -------------------- Cart API Functions --------------------

// Fetch all items in the cart
export const fetchCart = async (): Promise<CartItem[]> => {
  const token = localStorage.getItem("accessToken");
  const res = await fetch("http://localhost:3000/cart", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch cart: ${res.status} ${error}`);
  }

  return res.json();
};

// Add a product to the cart
export const addToCart = async (productId: string, quantity: number = 1): Promise<CartItem[]> => {
  const token = localStorage.getItem("accessToken");

  const res = await fetch("http://localhost:3000/cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId, quantity }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to add to cart: ${res.status} ${error}`);
  }

  return res.json(); // backend returns updated cart
};

// Remove an item from the cart (set quantity to 0)
export const removeFromCart = async (productId: string): Promise<CartItem[]> => {
  const token = localStorage.getItem("accessToken");

  const res = await fetch("http://localhost:3000/cart", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId, quantity: 0 }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to remove item: ${res.status} ${error}`);
  }

  return res.json(); // backend returns updated cart
};

// Update the quantity of a cart item
export const updateCartItem = async (productId: string, quantity: number): Promise<CartItem[]> => {
  const token = localStorage.getItem("accessToken");

  const res = await fetch("http://localhost:3000/cart", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId, quantity }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to update cart item: ${res.status} ${error}`);
  }

  return res.json(); // backend returns updated cart
};

// Checkout cart (clears cart)
export const checkoutCart = async (): Promise<CartItem[]> => {
  const token = localStorage.getItem("accessToken");

  const res = await fetch("http://localhost:3000/cart/checkout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to checkout: ${res.status} ${error}`);
  }

  return res.json(); // backend returns empty cart
};