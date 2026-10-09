/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@scrappy/core", "@scrappy/ui", "@scrappy/brand"],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
