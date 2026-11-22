"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Wilayah = { id: string; name: string };

type Props = {
  courseId: string;
  initialProvinces: Wilayah[];
};

export function CheckoutForm({ courseId, initialProvinces }: Props) {
  const router = useRouter();
  const [provinces, setProvinces] = useState<Wilayah[]>(initialProvinces);
  const [cities, setCities] = useState<Wilayah[]>([]);
  const [form, setForm] = useState({
    studentName: "",
    email: "",
    phone: "",
    provinceId: "",
    cityId: "",
    note: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Kalau initial kosong (API lambat), ambil di client.
  useEffect(() => {
    if (provinces.length > 0) return;
    fetch("/api/wilayah/provinces")
      .then((res) => res.json())
      .then((data) => setProvinces(data.data ?? []))
      .catch(() => setError("Gagal memuat daftar provinsi."));
  }, [provinces.length]);

  async function onProvinceChange(provinceId: string) {
    setForm((prev) => ({ ...prev, provinceId, cityId: "" }));
    setCities([]);
    if (!provinceId) return;

    try {
      const res = await fetch(`/api/wilayah/cities?provinceId=${encodeURIComponent(provinceId)}`);
      const data = await res.json();
      setCities(data.data ?? []);
    } catch {
      setError("Gagal memuat kota/kabupaten.");
    }
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const province = provinces.find((item) => item.id === form.provinceId);
    const city = cities.find((item) => item.id === form.cityId);

    if (!province || !city) {
      setError("Pilih provinsi dan kota terlebih dahulu.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          studentName: form.studentName,
          email: form.email,
          phone: form.phone,
          province: province.name,
          city: city.name,
          note: form.note || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const firstIssue = data.issues
          ? Object.values(data.issues as Record<string, string[]>)[0]?.[0]
          : null;
        throw new Error(firstIssue ?? data.error ?? "Pendaftaran gagal.");
      }

      const redirectUrl: string = data.redirectUrl;
      if (redirectUrl.startsWith("http")) {
        window.location.href = redirectUrl;
      } else {
        router.push(redirectUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-[var(--color-line)] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand-soft)]";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Nama lengkap</span>
          <input
            required
            minLength={2}
            className={inputClass}
            value={form.studentName}
            onChange={(event) => setForm({ ...form, studentName: event.target.value })}
            placeholder="Nama sesuai KTP"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Email</span>
          <input
            required
            type="email"
            className={inputClass}
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            placeholder="nama@email.com"
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium">Nomor WhatsApp</span>
        <input
          required
          className={inputClass}
          value={form.phone}
          onChange={(event) => setForm({ ...form, phone: event.target.value })}
          placeholder="08xxxxxxxxxx"
          inputMode="tel"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Provinsi</span>
          <select
            required
            className={inputClass}
            value={form.provinceId}
            onChange={(event) => onProvinceChange(event.target.value)}
          >
            <option value="">Pilih provinsi</option>
            {provinces.map((province) => (
              <option key={province.id} value={province.id}>
                {province.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Kota / Kabupaten</span>
          <select
            required
            className={inputClass}
            value={form.cityId}
            onChange={(event) => setForm({ ...form, cityId: event.target.value })}
            disabled={!form.provinceId || cities.length === 0}
          >
            <option value="">
              {form.provinceId ? "Pilih kota" : "Pilih provinsi dulu"}
            </option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium">
          Catatan <span className="font-normal text-[var(--color-ink-soft)]">(opsional)</span>
        </span>
        <textarea
          rows={3}
          className={inputClass}
          value={form.note}
          onChange={(event) => setForm({ ...form, note: event.target.value })}
          placeholder="Butuh invoice instansi? Tulis nama perusahaan di sini."
        />
      </label>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-[var(--color-brand)] px-4 py-3 text-sm font-medium text-white transition hover:bg-[var(--color-brand-dark)] disabled:opacity-60"
      >
        {loading ? "Memproses…" : "Lanjut ke pembayaran"}
      </button>

      <p className="text-center text-xs text-[var(--color-ink-soft)]">
        Dengan mendaftar, kamu menyetujui syarat layanan dan kebijakan privasi KelasKita.
      </p>
    </form>
  );
}
