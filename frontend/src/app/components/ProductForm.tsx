"use client";

import { useState } from "react";
import { createProduct } from "../lib/product-api";
import { useRouter } from "next/navigation";

const categories = ["Top Picks", "Best Seller", "Special Offer",];
const niches = ["living room", "kitchen", "bed room", "dining room", "office"];

export default function ProductForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    description: "",
    initialPrice: 0,
    discountPercent: 0,
    image: null as File | null,
    niche: "",
    category: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, files } = e.target as any;
    if (name === "image" && files) {
      setForm(prev => ({ ...prev, image: files[0] }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]:
          name === "initialPrice" || name === "discountPercent" ? Number(value) : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("initialPrice", form.initialPrice.toString());
      formData.append("discountPercent", form.discountPercent.toString());
      formData.append("niche", form.niche);
      formData.append("category", form.category);
      if (form.image) formData.append("image", form.image); // append file

      const res = await createProduct(formData);
      router.refresh();
      if (res._id) {
        setMessage("✅ Product created successfully!");
        setForm({
          name: "",
          description: "",
          initialPrice: 0,
          discountPercent: 0,
          image: null,
          niche: "",
          category: "",
        });
      } else {
        setMessage("Failed to create product.");
      }
    } catch (error) {
      setMessage("Error: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-xl space-y-4"
    >
      <h2 className="text-2xl font-bold">Create New Product</h2>

      <input
        type="text"
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Product Name"
        className="w-full p-2 border rounded-lg"
        required
      />

      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Product Description"
        className="w-full p-2 border rounded-lg"
        required
      />

      <input
        type="number"
        name="initialPrice"
        value={form.initialPrice}
        onChange={handleChange}
        placeholder="Initial Price"
        className="w-full p-2 border rounded-lg"
        required
      />

      <input
        type="number"
        name="discountPercent"
        value={form.discountPercent}
        onChange={handleChange}
        placeholder="Discount Percent (optional)"
        className="w-full p-2 border rounded-lg"
      />

      <input
        type="file"
        name="image"
        accept="image/*"
        onChange={handleChange}
        className="w-full p-2 border rounded-lg"
        required
      />

      {/* Category Dropdown */}
      <select
        name="category"
        value={form.category}
        onChange={handleChange}
        className="w-full p-2 border rounded-lg"
        required
      >
        <option value="">Select Category</option>
        {categories.map(cat => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      {/* Niche Dropdown */}
      <select
        name="niche"
        value={form.niche}
        onChange={handleChange}
        className="w-full p-2 border rounded-lg"
        required
      >
        <option value="">Select Niche</option>
        {niches.map(n => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
      >
        {loading ? "Creating..." : "Create Product"}
      </button>

      {message && <p className="text-center mt-2">{message}</p>}
    </form>
  );
}
