import { fetchProducts, Product } from "../lib/product-api";
import Image from "next/image";
import Link from 'next/link'

export default async function ProductsPage() {
  const products: Product[] = await fetchProducts();

  // Normalize values (lowercase + trim)
  const categories = Array.from(
    new Set(products.map((p) => p.category.trim().toLowerCase()))
  );
  const niches = Array.from(
    new Set(products.map((p) => p.niche.trim().toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-12 text-center">
        Our Products
      </h1>

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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {nicheProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ✅ Extracted card component (with discount badge inside image)
// ✅ Updated ProductCard component (replace the existing one in /products/page.tsx)
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

          {/* Floating discount badge */}
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
                  Ksh {(product.initialPrice * (1 - product.discountPercent / 100)).toFixed(0)}
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