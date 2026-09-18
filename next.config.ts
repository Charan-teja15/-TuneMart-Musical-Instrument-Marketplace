import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" }
    ]
  }
};

export default nextConfig;
