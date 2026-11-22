import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Halaman katalog & CMS membaca database saat request, bukan saat build.
  // cacheComponents dimatikan supaya `export const dynamic = "force-dynamic"` berlaku
  // dan image Docker bisa di-build tanpa akses database.
  cacheComponents: false,
  // Catatan: `output: "standalone"` sengaja TIDAK dipakai karena container
  // menjalankan `next start` (butuh .next + node_modules penuh). Untuk image
  // yang lebih kecil, ganti CMD ke `node .next/standalone/server.js` dan
  // salin .next/static ke dalam folder standalone.

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
