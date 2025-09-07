// lib/product-api.ts
export type Review = {
  _id: string;
  userId: string;
  name?: string; // reviewer’s name (optional if returned from backend)
  comment: string;
  rating: number;
  createdAt: string;
};

export type Product = {
  _id: string;
  name: string;
  description: string;
  initialPrice: number;
  discountPercent?: number;
  discountedPrice?: number;
  image?: string;
  niche: string;
  category: string;
  reviews?: Review[]; // 👈 added reviews
};

// ---------- Product APIs ----------

export const searchProducts = async (params: { search?: string; category?: string; niche?: string }) => {
  const query = new URLSearchParams(params as any).toString();
  const res = await fetch(`http://localhost:3000/products?${query}`);
  return res.json();
};

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch("http://localhost:3000/products", {
    cache: "no-store", // ensures fresh data every fetch
  });

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  return res.json();
}

export const fetchMyProducts = async () => {
  const token = localStorage.getItem("accessToken");
  const res = await fetch("http://localhost:3000/products/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const createProduct = async (formData: FormData) => {
  const token = localStorage.getItem("accessToken");
  const res = await fetch("http://localhost:3000/products", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // Note: DO NOT set Content-Type; the browser will set it automatically with FormData
    },
    body: formData,
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to create product: ${res.status} ${error}`);
  }

  return res.json();
};

export const updateProduct = async (id: string, formData: FormData) => {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(`http://localhost:3000/products/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      // same here: don’t set Content-Type
    },
    body: formData,
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Update failed: ${res.status} ${error}`);
  }

  return res.json();
};

export const deleteProduct = async (id: string) => {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(`http://localhost:3000/products/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to delete product");
  return res.json();
};

export async function fetchProductById(id: string): Promise<Product> {
  const res = await fetch(`http://localhost:3000/products/${id}`, {
    cache: "no-store", // ensures always fresh data
  });

  if (!res.ok) {
    throw new Error("Failed to fetch product");
  }

  return res.json();
}

// ---------- Review APIs ----------

export const addReview = async (productId: string, review: { comment: string; rating: number }) => {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(`http://localhost:3000/products/${productId}/reviews`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(review),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to add review: ${res.status} ${error}`);
  }

  return res.json();
};




// ---------- Cart APIs ----------

export type CartItem = {
  _id: string;          // cart item ID
  productId: string;
  name: string;
  image?: string;
  price: number;        // discounted price if applicable
  quantity: number;
  subtotal: number;     // price * quantity
};

// Add item to cart
export const addToCat = async (productId: string, quantity: number = 1) => {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(`http://localhost:3000/cart`, {
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

  return res.json();
};

// Get current user cart
export const fetchCart = async (): Promise<CartItem[]> => {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(`http://localhost:3000/cart`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch cart");
  }

  return res.json();
};

// Update item quantity in cart
export const updateCartItem = async (itemId: string, quantity: number) => {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(`http://localhost:3000/cart/${itemId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ quantity }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to update cart item: ${res.status} ${error}`);
  }

  return res.json();
};

// Remove item from cart
export const removeCartItem = async (itemId: string) => {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(`http://localhost:3000/cart/${itemId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to remove cart item: ${res.status}`);
  }

  return res.json();
};

// Checkout (MVP: simply clears the cart)
export const checkoutCart = async () => {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(`http://localhost:3000/cart/checkout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to checkout: ${res.status} ${error}`);
  }

  return res.json();
};

