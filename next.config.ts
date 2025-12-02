import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  //swcMinify: true,
  images: {
    unoptimized: true
  },
  output: "export"
};

export default nextConfig;
