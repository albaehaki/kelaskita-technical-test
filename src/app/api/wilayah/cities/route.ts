import { NextRequest } from "next/server";
import { getCities } from "@/lib/wilayah";

export async function GET(request: NextRequest) {
  const provinceId = request.nextUrl.searchParams.get("provinceId");
  if (!provinceId) {
    return Response.json({ error: "provinceId wajib diisi" }, { status: 400 });
  }

  const result = await getCities(provinceId);
  return Response.json(result, {
    headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
  });
}
