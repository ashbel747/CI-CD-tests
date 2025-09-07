"use client";

import React, { useState, useEffect } from "react";
import { Product } from "../lib/product-api";
import ProductGroup from "./ProductGroup";

interface ProductListProps {
  initialProducts: Product[];
}

const ProductList: React.FC<ProductListProps> = ({ initialProducts }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const query = search.toLowerCase();
    const filtered = initialProducts.filter((p: Product) =>
      [p.name, p.description, p.category, p.niche]
        .map((field) => field.toLowerCase())
        .some((field) => field.includes(query))
    );
    setProducts(filtered);
  }, [search, initialProducts]);

  // Grouping logic
  const categories = Array.from(
    new Set(products.map((p) => p.category.trim().toLowerCase()))
  );
  const niches = Array.from(
    new Set(products.map((p) => p.niche.trim().toLowerCase()))
  );

  return (
    <>
      {/* Search Input */}
      <div className="flex justify-center mb-12">
        <input
          type="text"
          placeholder="Search products by name, category, or niche..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-lg p-3 border border-gray-300 rounded-xl shadow-sm 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 
                     bg-pink-300 dark:bg-white text-black"
        />
      </div>

      {/* Categories */}
      {categories.map((category) => {
        const categoryProducts = products.filter(
          (p) => p.category.trim().toLowerCase() === category
        );
        return (
          <ProductGroup
            key={category}
            title={category}
            products={categoryProducts}
          />
        );
      })}

      {/* Niches */}
      {niches.map((niche) => {
        const nicheProducts = products.filter(
          (p) => p.niche.trim().toLowerCase() === niche
        );
        return (
          <ProductGroup key={niche} title={niche} products={nicheProducts} />
        );
      })}
    </>
  );
};

export default ProductList;
