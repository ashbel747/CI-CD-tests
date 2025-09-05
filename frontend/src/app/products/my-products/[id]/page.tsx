"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchProductById, updateProduct, Product } from "../../../lib/product-api";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await fetchProductById(id as string);
        setProduct(data);
      } catch (err) {
        console.error("Failed to fetch product:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const updated = {
      name: form.get("name") as string,
      description: form.get("description") as string,
      initialPrice: Number(form.get("initialPrice")),
      discountPercent: Number(form.get("discountPercent")),
      category: form.get("category") as string,
      niche: form.get("niche") as string,
    };

    try {
      await updateProduct(id as string, updated);
      router.push("/products/my-products");
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update product. Check console for details.");
    }
  }

  if (loading) return <p className="p-6">Loading...</p>;
  if (!product) return <p className="p-6">Product not found.</p>;

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6 mt-10">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          defaultValue={product.name}
          className="w-full border p-2 rounded"
          required
        />
        <textarea
          name="description"
          defaultValue={product.description}
          className="w-full border p-2 rounded"
          required
        />
        <input
          name="initialPrice"
          defaultValue={product.initialPrice}
          type="number"
          className="w-full border p-2 rounded"
          required
        />
        <input
          name="discountPercent"
          defaultValue={product.discountPercent}
          type="number"
          className="w-full border p-2 rounded"
        />
        <input
          name="category"
          defaultValue={product.category}
          className="w-full border p-2 rounded"
          required
        />
        <input
          name="niche"
          defaultValue={product.niche}
          className="w-full border p-2 rounded"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save
        </button>
      </form>
    </div>
  );
}
