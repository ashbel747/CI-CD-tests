export const dynamic = "force-dynamic";

import { fetchProducts, Product } from "../lib/product-api";
import { Metadata } from "next";
import ProductGroup from "../components/ProductGroup";

export const metadata: Metadata = {
  title: "Our Products - Home Deco",
  description:
    "Browse our wide selection of products across categories and niches. Find discounts and best deals here.",
  keywords: ["products", "shopping", "discounts", "categories", "niches"],
};

const ProductsPage = async () => {
  const allProducts: Product[] = await fetchProducts();

  // Grouping logic
  const categories: string[] = Array.from(
    new Set(allProducts.map((p) => p.category.trim().toLowerCase()))
  );
  const niches: string[] = Array.from(
    new Set(allProducts.map((p) => p.niche.trim().toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 p-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 text-center">
        Our Products
      </h1>

      {/* Categories */}
      {categories.map((category) => {
        const categoryProducts = allProducts.filter(
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
        const nicheProducts = allProducts.filter(
          (p) => p.niche.trim().toLowerCase() === niche
        );
        return (
          <ProductGroup key={niche} title={niche} products={nicheProducts} />
        );
      })}
    </div>
  );
};

export default ProductsPage;
