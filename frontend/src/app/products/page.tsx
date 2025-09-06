"use client";

import { useState, useEffect } from "react";
import { fetchProducts, Product } from "../lib/product-api";
import Image from "next/image";
import Link from "next/link";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      const allProducts = await fetchProducts();

      // Apply client-side search filtering
      const filtered = allProducts.filter((p: Product) => {
        const query = search.toLowerCase();
        return (
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.niche.toLowerCase().includes(query)
        );
      });

      setProducts(filtered);
    };

    loadProducts();
  }, [search]);

  // Normalize values for grouping
  const categories = Array.from(
    new Set(products.map((p) => p.category.trim().toLowerCase()))
  );
  const niches = Array.from(
    new Set(products.map((p) => p.niche.trim().toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Our Products
      </h1>

      {/* 🔍 Search Input */}
      <div className="flex justify-center mb-12">
        <input
          type="text"
          placeholder="Search products by name, category, or niche..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-lg p-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-pink-300 dark:bg-white text-black"
        />
      </div>

      {/* Loop through categories */}
      {categories.map((category) => {
        const categoryProducts = products.filter(
          (p) => p.category.trim().toLowerCase() === category
        );

        return (
          <div key={category} className="mb-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center capitalize">
              {category.replace("-", " ")}
            </h2>

            <div className="flex gap-6 overflow-x-auto scrollbar-hide px-2">
              {categoryProducts.map((product) => (
                <div key={product._id} className="flex-none w-80">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Loop through niches */}
      {niches.map((niche) => {
        const nicheProducts = products.filter(
          (p) => p.niche.trim().toLowerCase() === niche
        );

        return (
          <div key={niche} className="mb-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center capitalize">
              {niche.replace("-", " ")}
            </h2>

            <div className="flex gap-6 overflow-x-auto scrollbar-hide px-2">
              {nicheProducts.map((product) => (
                <div key={product._id} className="flex-none w-80">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ✅ Product Card
function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-white shadow-md rounded-2xl overflow-hidden hover:shadow-lg transition cursor-pointer">
      <Link href={`/products/${product._id}`}>
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
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
              -{product.discountPercent}%
            </span>
          )}
        </div>

        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {product.name}
          </h2>

          <div className="flex items-center gap-2 mb-3">
            {product.discountPercent ? (
              <>
                <span className="text-gray-400 line-through">
                  Ksh {product.initialPrice}
                </span>
                <span className="text-green-600 font-bold">
                  Ksh{" "}
                  {(
                    product.initialPrice *
                    (1 - product.discountPercent / 100)
                  ).toFixed(0)}
                </span>
              </>
            ) : (
              <span className="text-green-600 font-bold">
                Ksh {product.initialPrice}
              </span>
            )}
          </div>

          <div className="flex justify-between text-sm text-gray-500">
            <span className="px-2 py-1 bg-gray-100 rounded-lg">
              {product.niche}
            </span>
            <span className="px-2 py-1 bg-gray-100 rounded-lg">
              {product.category}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
