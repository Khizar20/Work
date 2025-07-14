import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdf-text-reader'],
  // Note: body size limits in Next.js 15 are handled differently
  // The upload size will be managed in the API route itself
};

export default nextConfig;
