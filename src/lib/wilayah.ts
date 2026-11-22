/**
 * Integrasi API eksternal: API Wilayah Indonesia (emsifa) — gratis, tanpa API key.
 * Dipakai untuk dropdown provinsi/kota di form pendaftaran.
 *
 * Strategi: fetch di server dengan cache 24 jam; kalau API eksternal down,
 * pakai fallback statis supaya form tetap bisa dipakai.
 */

export type Wilayah = { id: string; name: string };

const BASE = "https://www.emsifa.com/api-wilayah-indonesia/api";

const FALLBACK_PROVINCES: Wilayah[] = [
  { id: "32", name: "JAWA BARAT" },
  { id: "31", name: "DKI JAKARTA" },
  { id: "33", name: "JAWA TENGAH" },
  { id: "35", name: "JAWA TIMUR" },
  { id: "34", name: "DI YOGYAKARTA" },
  { id: "36", name: "BANTEN" },
];

const FALLBACK_CITIES: Record<string, Wilayah[]> = {
  "32": [
    { id: "3275", name: "KOTA BEKASI" },
    { id: "3273", name: "KOTA BANDUNG" },
    { id: "3201", name: "KABUPATEN BOGOR" },
  ],
  "31": [
    { id: "3171", name: "KOTA JAKARTA SELATAN" },
    { id: "3172", name: "KOTA JAKARTA TIMUR" },
  ],
};

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    next: { revalidate: 86_400 },
    signal: AbortSignal.timeout(6_000),
  });
  if (!res.ok) throw new Error(`Wilayah API ${res.status}`);
  return (await res.json()) as T;
}

export async function getProvinces(): Promise<{ data: Wilayah[]; source: "api" | "fallback" }> {
  try {
    const data = await fetchJson<Wilayah[]>(`${BASE}/provinces.json`);
    if (!Array.isArray(data) || data.length === 0) throw new Error("empty");
    return { data, source: "api" };
  } catch {
    return { data: FALLBACK_PROVINCES, source: "fallback" };
  }
}

export async function getCities(
  provinceId: string
): Promise<{ data: Wilayah[]; source: "api" | "fallback" }> {
  try {
    const data = await fetchJson<Wilayah[]>(`${BASE}/regencies/${provinceId}.json`);
    if (!Array.isArray(data)) throw new Error("invalid");
    return { data, source: "api" };
  } catch {
    return { data: FALLBACK_CITIES[provinceId] ?? [], source: "fallback" };
  }
}
