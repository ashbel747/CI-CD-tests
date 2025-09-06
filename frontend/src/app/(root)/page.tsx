import HeroCarousel from "../components/HeroCarousel";
import ProductsPage from "../products/page";

export default function HomePage() {

  return (
    <div className="min-h-screen">
      <HeroCarousel />
      <ProductsPage />
    </div>
  );
}