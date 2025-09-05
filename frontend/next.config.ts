import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "example.com", // replace with your actual domain
      },
      {
        protocol: "https",
        hostname: "picsum.photos", // if you want placeholder images
      },
    ],
  },
};

export default nextConfig;
