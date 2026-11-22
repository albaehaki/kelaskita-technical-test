import { NextRequest } from "next/server";
import { getProvinces } from "@/lib/wilayah";

export async function GET() {
  const result = await getProvinces();
  return Response.json(result, {
    headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
  });
}
