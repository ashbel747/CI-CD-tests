import HeroCarousel from "../components/HeroCarousel";
import ProductsPage from "../products/page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home Decor",
  description:
    "Discover modern home decor collections. Exclusive deals with up to 25% OFF. Create spaces that bring joy and comfort.",
  keywords: [
    "home decor",
    "furniture",
    "modern living",
    "luxury sofa",
    "interior design",
    "discounts",
  ],
};

export default function HomePage() {

  return (
    <div className="min-h-screen">
      <HeroCarousel />
      <ProductsPage />
    </div>
  );
}