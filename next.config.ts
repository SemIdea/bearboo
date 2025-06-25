import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    typedRoutes: true,
    authInterrupts: true
  }
};

export default nextConfig;
