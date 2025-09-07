import { Metadata } from "next";
import { fetchProducts, Product } from "../lib/product-api";
import ProductList from "../components/ProductList";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Products - Home Deco",
  description:
    "Browse our wide selection of products across categories and niches. Find discounts and best deals here.",
  keywords: ["products", "shopping", "discounts", "categories", "niches"],
};

export default async function ProductsPage() {
  const allProducts: Product[] = await fetchProducts();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 p-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 text-center">
        Our Products
      </h1>
      {/* Client component handles search & filtering */}
      <ProductList initialProducts={allProducts} />
    </div>
  );
}
