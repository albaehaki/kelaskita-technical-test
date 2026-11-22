"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PayButton({ invoiceNo }: { invoiceNo: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/payments/mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceNo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Pembayaran gagal");
      router.push(`/invoice/${invoiceNo}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pembayaran gagal");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={pay}
        disabled={loading}
        className="w-full rounded-xl bg-[var(--color-brand)] px-4 py-3 text-sm font-medium text-white hover:bg-[var(--color-brand-dark)] disabled:opacity-60"
      >
        {loading ? "Memproses pembayaran…" : "Bayar sekarang (simulasi)"}
      </button>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <p className="text-center text-xs text-[var(--color-ink-soft)]">
        Ini mock gateway — tidak ada uang yang benar-benar dipindahkan.
      </p>
    </div>
  );
}
