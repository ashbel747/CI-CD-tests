import { Product } from "@/app/lib/product-api";
import ProductCard from "./ProductCard";

type Props = {
  title: string;
  products: Product[];
};

const ProductGroup = ({ title, products }: Props) => (
  <div className="mb-16">
    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center capitalize">
      {title.replace("-", " ")}
    </h2>
    <div className="flex gap-6 overflow-x-auto scrollbar-hide px-2">
      {products.map((product) => (
        <div key={product._id} className="flex-none w-80">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  </div>
);

export default ProductGroup;
