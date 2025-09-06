"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
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

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000); // auto-slide every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[50vh] overflow-hidden rounded-xl shadow-lg">
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
            alt={slides[current].title}
            fill
            className="object-cover"
            priority
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 flex flex-col justify-center px-8 md:px-16 text-white">
            <h2 className="text-3xl md:text-4xl font-bold">
              {slides[current].title}
            </h2>
            <p className="text-lg md:text-xl mb-4">{slides[current].subtitle}</p>

            <div className="bg-white/80 text-black p-4 rounded-lg max-w-sm">
              <h3 className="font-bold">{slides[current].offer}</h3>
              <p className="text-sm">{slides[current].discount}</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots Navigation */}
      <div className="absolute bottom-4 w-full flex justify-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full transition ${
              index === current ? "bg-white" : "bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
