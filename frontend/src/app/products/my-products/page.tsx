"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "../../lib/product-api";
import  {fetchMyProducts, deleteProduct} from '@/app/lib/product-api-client'
type ErrorState = {
  message: string;
  status?: number;
};

export default function MyProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorState | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await fetchMyProducts();

        if (!Array.isArray(data)) {
          throw { message: "Unauthorized to access products", status: 403 };
        }

        setProducts(data);
      } catch (err: any) {
        console.error("Failed to fetch my products", err);
        setError({
          message: err?.message || "Something went wrong",
          status: err?.status,
        });
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete product");
    }
  }

  // ---- UI states ----
  if (loading) return <p className="p-6 mt-11">Loading...</p>;
  if (error)
    return (
      <div className="p-6 text-center text-red-600">
        <h2 className="text-2xl font-semibold mb-2">You should have a correct user role to access this page!!</h2>
        <p>{error.message}</p>
      </div>
    );
  if (products.length === 0)
    return <p className="p-6 text-black dark:text-white">No products created yet.</p>;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800 p-8 mt-11">
      <h1 className="text-3xl font-bold text-black dark:text-white mb-12 text-center">
        My Products
      </h1>

      <div className="m-3">
        <Link
          href={`/products/create`}
          className="bg-gray-400 dark:bg-pink-400 text-black dark:text-white font-bold p-3 rounded shadow-md"
        >
          Create new product
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            onDelete={() => handleDelete(product._id)}
          />
        ))}
      </div>
    </div>
  );
}

function ProductCard({
  product,
  onDelete,
}: {
  product: Product;
  onDelete: () => void;
}) {
  return (
    <div className="bg-gray-400 dark:bg-gray-700 text-black dark:text-white shadow-md rounded-2xl overflow-hidden hover:shadow-lg transition">
      <div className="relative">
        {product.image && (
          <Image
            src={product.image || "/placeholder.png"}
            alt={product.name}
            width={500}
            height={200}
            className="h-48 w-full object-cover"
          />
        )}

        {product.discountPercent && (
          <span className="absolute top-2 right-2 bg-red-500 text-xs font-bold px-3 py-1 rounded-full shadow-md">
            - {product.discountPercent}%
          </span>
        )}
      </div>

      <div className="p-4">
        <h2 className="text-lg font-semibold">{product.name}</h2>

        <div className="flex items-center gap-2 mb-3">
          {product.discountedPrice ? (
            <>
              <span className="line-through">
                Ksh {product.initialPrice}
              </span>
              <span className="text-green-600 font-bold">
                Ksh {product.discountedPrice}
              </span>
            </>
          ) : (
            <span className="text-green-600 font-bold">
              Ksh {product.initialPrice}
            </span>
          )}
        </div>

        <div className="flex justify-between text-sm text-gray-500 mb-4">
          <span className="px-2 py-1 bg-gray-100 rounded-lg">
            {product.niche}
          </span>
          <span className="px-2 py-1 bg-gray-100 rounded-lg">
            {product.category}
          </span>
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <Link
            href={`/products/my-products/${product._id}`}
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            Edit
          </Link>
          <button
            onClick={onDelete}
            className="text-red-600 hover:underline text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
