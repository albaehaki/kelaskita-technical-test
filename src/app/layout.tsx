import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "KelasKita — Kelas IT praktis untuk karier nyata",
    template: "%s · KelasKita",
  },
  description:
    "Platform kelas IT dengan pendaftaran online, pembayaran terintegrasi, dan materi yang bisa langsung dipraktikkan.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
