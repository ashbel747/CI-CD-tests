"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {updateProduct, fetchProductById, Product } from "../../lib/product-api";
import axios from "axios";

export default function EditProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await fetchProductById(id as string);
        setProduct(data);
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setMessage({ type: "error", text: "Failed to load product." });
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    if (!product) return;

    const form = new FormData();
    form.append("name", (e.currentTarget.elements.namedItem("name") as HTMLInputElement).value);
    form.append("description", (e.currentTarget.elements.namedItem("description") as HTMLInputElement).value);
    form.append("initialPrice", (e.currentTarget.elements.namedItem("initialPrice") as HTMLInputElement).value);
    form.append("discountPercent", (e.currentTarget.elements.namedItem("discountPercent") as HTMLInputElement).value);
    form.append("category", (e.currentTarget.elements.namedItem("category") as HTMLInputElement).value);
    form.append("niche", (e.currentTarget.elements.namedItem("niche") as HTMLInputElement).value);

    if (imageFile) form.append("image", imageFile);

    try {
      const updated = await updateProduct(id as string, form);
      setProduct(updated);
      setImageFile(null);
      setMessage({ type: "success", text: "Product updated successfully!" });
    } catch (err: any) {
      console.error(err);
      setMessage({ type: "error", text: err.message || "Update failed" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!product) return <p className="p-6">Product not found.</p>;

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6 mt-10">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>

      {message && (
        <div
          className={`mb-4 p-2 rounded ${
            message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" defaultValue={product.name} className="w-full border p-2 rounded" required />
        <textarea name="description" defaultValue={product.description} className="w-full border p-2 rounded" required />
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
        <input name="category" defaultValue={product.category} className="w-full border p-2 rounded" required />
        <input name="niche" defaultValue={product.niche} className="w-full border p-2 rounded" required />

        <div>
          <label className="block mb-1 font-medium">Upload New Image (optional)</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          {product.image && !imageFile && (
            <img src={product.image} alt={product.name} className="mt-2 w-32 h-32 object-cover rounded" />
          )}
          {imageFile && (
            <img src={URL.createObjectURL(imageFile)} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded" />
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {submitting ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}
