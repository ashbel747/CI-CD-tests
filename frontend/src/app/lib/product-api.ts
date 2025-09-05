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
