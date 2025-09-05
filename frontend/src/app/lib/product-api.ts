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

export const createProduct = async (form: any) => {
  const token = localStorage.getItem("accessToken");
  const res = await fetch("http://localhost:3000/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(form),
  });
  return res.json();
};

export const updateProduct = async (id: string, form: any) => {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(`http://localhost:3000/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(form),
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
