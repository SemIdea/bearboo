import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    typedRoutes: true,
    authInterrupts: true
  }
};

export default nextConfig;
