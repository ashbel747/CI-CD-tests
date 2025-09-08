"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// Slide type
type Slide = {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  offer: string;
  discount: string;
};

const slides: Slide[] = [
  {
    id: 1,
    image: "/carousel1.jpeg",
    title: "Hi, Welcome Back",
    subtitle: "Create spaces that bring joy",
    offer: "SPECIAL OFFER | Experience Comfort",
    discount: "Order now and get discount! 20% OFF",
  },
  {
    id: 2,
    image: "/carousel2.jpg",
    title: "Upgrade Your Home",
    subtitle: "Modern furniture for every style",
    offer: "LIMITED DEAL | Feel the Comfort",
    discount: "Shop today and save 15%",
  },
  {
    id: 3,
    image: "/carousel3.jpeg",
    title: "Luxury Living",
    subtitle: "Designs that inspire",
    offer: "HOT SALE | Relax in Style",
    discount: "Exclusive 25% OFF this week",
  },
];

const HeroCarousel: React.FC = () => {
  const [current, setCurrent] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000); // auto-slide every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      data-testid="hero-carousel"
      className="relative w-full h-[50vh] md:h-[70vh] overflow-hidden shadow-lg mt-11"
      aria-label="Promotional Furniture Carousel"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={slides[current].id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <Image
            src={slides[current].image}
            alt={`${slides[current].title} - ${slides[current].subtitle}`}
            fill
            className="object-cover"
            priority={current === 0} // only preload first image
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 flex flex-col justify-center px-8 md:px-16 text-white">
            <h1 className="text-3xl md:text-5xl font-bold">
              {slides[current].title}
            </h1>
            <p className="text-lg md:text-xl mb-4">
              {slides[current].subtitle}
            </p>

            <aside className="bg-white/80 text-black p-4 rounded-lg max-w-sm">
              <h2 className="font-bold">{slides[current].offer}</h2>
              <p className="text-sm">{slides[current].discount}</p>
            </aside>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots Navigation */}
      <nav
        className="absolute bottom-4 w-full flex justify-center gap-2"
        aria-label="Carousel Navigation"
      >
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full transition ${
              index === current ? "bg-white" : "bg-gray-400"
            }`}
            aria-label={`Go to slide ${index + 1}`}
            aria-pressed={index === current}
          />
        ))}
      </nav>
    </section>
  );
};

export default HeroCarousel;
