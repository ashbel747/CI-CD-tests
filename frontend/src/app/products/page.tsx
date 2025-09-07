"use client";

import React, { useState, useEffect } from "react";
import { fetchProducts, Product } from "../lib/product-api";
import Image from "next/image";
import Link from "next/link";

// Props for ProductGroup
interface ProductGroupProps {
  title: string;
  products: Product[];
}

// Props for ProductCard
interface ProductCardProps {
  product: Product;
}

// Main Products Page
const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    const loadProducts = async () => {
      const allProducts: Product[] = await fetchProducts();

      const query = search.toLowerCase();
      const filtered = allProducts.filter((p: Product) =>
        [p.name, p.description, p.category, p.niche]
          .map((field) => field.toLowerCase())
          .some((field) => field.includes(query))
      );

      setProducts(filtered);
    };

    loadProducts();
  }, [search]);

  // Grouping logic
  const categories: string[] = Array.from(
    new Set(products.map((p) => p.category.trim().toLowerCase()))
  );
  const niches: string[] = Array.from(
    new Set(products.map((p) => p.niche.trim().toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 p-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 text-center">
        Our Products
      </h1>

      {/* Search Input */}
      <div className="flex justify-center mb-12">
        <input
          type="text"
          placeholder="Search products by name, category, or niche..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
          className="w-full max-w-lg p-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-pink-300 dark:bg-white text-black"
        />
      </div>

      {/* Categories */}
      {categories.map((category: string) => {
        const categoryProducts: Product[] = products.filter(
          (p) => p.category.trim().toLowerCase() === category
        );
        return (
          <ProductGroup key={category} title={category} products={categoryProducts} />
        );
      })}

      {/* Niches */}
      {niches.map((niche: string) => {
        const nicheProducts: Product[] = products.filter(
          (p) => p.niche.trim().toLowerCase() === niche
        );
        return <ProductGroup key={niche} title={niche} products={nicheProducts} />;
      })}
    </div>
  );
};

// Grouping Component
const ProductGroup: React.FC<ProductGroupProps> = ({ title, products }) => (
  <div className="mb-16">
    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center capitalize">
      {title.replace("-", " ")}
    </h2>
    <div className="flex gap-6 overflow-x-auto scrollbar-hide px-2">
      {products.map((product: Product) => (
        <div key={product._id} className="flex-none w-80">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  </div>
);

// Product Card Component
const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const discountedPrice: number | string = product.discountPercent
    ? (
        product.initialPrice *
        (1 - product.discountPercent / 100)
      ).toFixed(0)
    : product.initialPrice;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl overflow-hidden hover:shadow-lg transition cursor-pointer">
      <Link href={`/products/${product._id}`}>
        <div className="relative">
          <Image
            src={product.image || "/placeholder.png"}
            alt={product.name}
            width={500}
            height={200}
            className="h-48 w-full object-cover"
          />
          {product.discountPercent && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded shadow-md">
              -{product.discountPercent}%
            </span>
          )}
        </div>

        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            {product.name}
          </h2>

          <div className="flex items-center gap-2 mb-3">
            {product.discountPercent ? (
              <>
                <span className="text-gray-400 line-through">
                  Ksh {product.initialPrice}
                </span>
                <span className="text-green-600 font-bold">Ksh {discountedPrice}</span>
              </>
            ) : (
              <span className="text-green-600 font-bold">
                Ksh {product.initialPrice}
              </span>
            )}
          </div>

          <div className="flex justify-between text-sm text-gray-500">
            <span className="px-2 py-1 bg-gray-100 rounded-lg">{product.niche}</span>
            <span className="px-2 py-1 bg-gray-100 rounded-lg">{product.category}</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductsPage;
