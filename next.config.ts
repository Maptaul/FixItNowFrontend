import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Generated avatars for technicians and customers.
      { protocol: "https", hostname: "api.dicebear.com" },
      // Free-to-use photography for service/category imagery.
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.ibb.co" },
      { protocol: "https", hostname: "i.ibb.co.com" },
    ],
  },
};

export default nextConfig;
