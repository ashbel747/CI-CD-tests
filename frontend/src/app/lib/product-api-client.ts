'use client';

import { apiCall } from "./auth";

// ---------- Authenticated Product APIs (Client-side only) ----------

export const fetchMyProducts = async () => {
  // apiCall returns the parsed JSON directly
  const data = await apiCall("/products/me");
  return data;
};

export const createProduct = async (formData: FormData) => {
  // apiCall returns the parsed JSON directly, not a Response object
  const data = await apiCall("/products", {
    method: "POST",
    // The browser will automatically set the Content-Type header to multipart/form-data for FormData.
    body: formData,
  });

  return data;
};

export const updateProduct = async (id: string, formData: FormData) => {
  // apiCall returns the parsed JSON directly, not a Response object
  const data = await apiCall(`/products/${id}`, {
    method: "PUT",
    // The browser will automatically set the Content-Type header to multipart/form-data for FormData.
    body: formData,
  });

  return data;
};

export const deleteProduct = async (id: string) => {
  // apiCall returns the parsed JSON directly
  const data = await apiCall(`/products/${id}`, {
    method: "DELETE",
  });
  return data;
};

// ---------- Review APIs (Client-side only) ----------

export const addReview = async (productId: string, review: { comment: string; rating: number }) => {
  // apiCall returns the parsed JSON directly, not a Response object
  const data = await apiCall(`/products/${productId}/reviews`, {
    method: "POST",
    body: JSON.stringify(review),
  });

  return data;
};