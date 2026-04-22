import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname), // Одоогийн төслийн үндсэн хавтас
  },
};

export default nextConfig;