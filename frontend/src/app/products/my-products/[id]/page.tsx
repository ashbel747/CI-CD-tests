"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchProductById, updateProduct, Product } from "../../../lib/product-api";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function loadProduct() {
      const data = await fetchProductById(id as string);
      setProduct(data);
    }
    loadProduct();
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const updated = {
      name: form.get("name"),
      description: form.get("description"),
      initialPrice: form.get("initialPrice"),
      discountPercent: form.get("discountPercent"),
      category: form.get("category"),
      niche: form.get("niche"),
    };
    await updateProduct(id as string, updated);
    router.push("/products/my-products");
  }

  if (!product) return <p className="p-6">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6 mt-10">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" defaultValue={product.name} className="w-full border p-2 rounded" />
        <textarea name="description" defaultValue={product.description} className="w-full border p-2 rounded" />
        <input name="initialPrice" defaultValue={product.initialPrice} type="number" className="w-full border p-2 rounded" />
        <input name="discountPercent" defaultValue={product.discountPercent} type="number" className="w-full border p-2 rounded" />
        <input name="category" defaultValue={product.category} className="w-full border p-2 rounded" />
        <input name="niche" defaultValue={product.niche} className="w-full border p-2 rounded" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
      </form>
    </div>
  );
}
