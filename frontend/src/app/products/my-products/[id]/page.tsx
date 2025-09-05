"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchProductById, updateProduct, Product } from "../../../lib/product-api";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [newImage, setNewImage] = useState<File | null>(null);

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
    if (!product) return;

    const formData = new FormData();
    formData.append("name", (e.currentTarget.name as HTMLInputElement).value);
    formData.append("description", (e.currentTarget.description as HTMLTextAreaElement).value);
    formData.append("initialPrice", (e.currentTarget.initialPrice as HTMLInputElement).value);
    formData.append("discountPercent", (e.currentTarget.discountPercent as HTMLInputElement).value);
    formData.append("category", (e.currentTarget.category as HTMLInputElement).value);
    formData.append("niche", (e.currentTarget.niche as HTMLInputElement).value);

    if (newImage) {
      formData.append("image", newImage);
    }

    try {
      await updateProduct(id as string, formData, !!newImage);
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
        <input name="name" defaultValue={product.name} className="w-full border p-2 rounded" required />
        <textarea name="description" defaultValue={product.description} className="w-full border p-2 rounded" required />
        <input name="initialPrice" defaultValue={product.initialPrice} type="number" className="w-full border p-2 rounded" required />
        <input name="discountPercent" defaultValue={product.discountPercent} type="number" className="w-full border p-2 rounded" />
        <input name="category" defaultValue={product.category} className="w-full border p-2 rounded" required />
        <input name="niche" defaultValue={product.niche} className="w-full border p-2 rounded" required />

        <div>
          <label className="block mb-1 font-medium">Update Image (optional)</label>
          <input type="file" accept="image/*" onChange={(e) => setNewImage(e.target.files?.[0] || null)} />
          {product.image && !newImage && <img src={product.image} alt="Current" className="mt-2 w-32 h-32 object-cover" />}
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Save
        </button>
      </form>
    </div>
  );
}
