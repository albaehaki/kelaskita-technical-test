"use client";

import { useLayoutEffect, useRef, useState } from "react";

/**
 * Sertifikat punya desain tetap (A4 landscape) supaya bentuknya identik di semua
 * ukuran layar. Komponen ini hanya mengecilkan skala secara utuh, bukan mengubah
 * susunan elemen. Saat dicetak, skala dinormalkan kembali (lihat CSS @media print).
 */
export function CertificateScaler({
  width,
  height,
  children,
}: {
  width: number;
  height: number;
  children: React.ReactNode;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const element = frameRef.current;
    if (!element) return;

    const update = () => {
      const available = element.clientWidth;
      setScale(Math.min(1, available / width));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [width]);

  return (
    <div ref={frameRef} className="w-full">
      <div className="cert-frame" style={{ height: Math.round(height * scale) }}>
        <div
          className="cert-zoom"
          style={{
            width,
            height,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
