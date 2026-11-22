import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Halaman katalog & CMS membaca database saat request, bukan saat build.
  // cacheComponents dimatikan supaya `export const dynamic = "force-dynamic"` berlaku
  // dan image Docker bisa di-build tanpa akses database.
  cacheComponents: false,
  output: "standalone",
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
