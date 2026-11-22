"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function StudentLoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", invoiceNo: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/student/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal masuk");
      router.push("/kelas-saya");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal masuk");
      setLoading(false);
    }
  }

  const input =
    "w-full rounded-xl border border-[var(--color-line)] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-brand)]";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium">Email saat mendaftar</span>
        <input
          type="email"
          required
          className={input}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="nama@email.com"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium">Nomor invoice</span>
        <input
          required
          className={input}
          value={form.invoiceNo}
          onChange={(e) => setForm({ ...form, invoiceNo: e.target.value })}
          placeholder="KK-20261122-XXXXX"
        />
      </label>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <button
        disabled={loading}
        className="w-full rounded-xl bg-[var(--color-brand)] px-4 py-3 text-sm font-medium text-white hover:bg-[var(--color-brand-dark)] disabled:opacity-60"
      >
        {loading ? "Memeriksa…" : "Masuk ke kelas saya"}
      </button>

      <p className="text-xs leading-relaxed text-[var(--color-ink-soft)]">
        Nomor invoice ada di halaman setelah pembayaran dan di email konfirmasi.
        Akses hanya terbuka untuk invoice berstatus <b>lunas</b>.
      </p>
    </form>
  );
}
