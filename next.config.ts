import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // fotos ja chegam comprimidas; a Vercel aceita no maximo 4.5 MB por request
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;