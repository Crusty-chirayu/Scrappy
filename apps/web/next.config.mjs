/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@scrappy/core", "@scrappy/ui", "@scrappy/brand"],
  experimental: {
    optimizePackageImports: ["@scrappy/ui", "lucide-react"],
  },
};

export default nextConfig;
