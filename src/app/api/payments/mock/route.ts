import { z } from "zod";
import { markEnrollmentPaid } from "@/lib/enrollment-service";

const schema = z.object({ invoiceNo: z.string().min(3) });

/** Simulasi "Bayar sekarang" pada halaman mock gateway. */
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "invoiceNo wajib diisi" }, { status: 400 });
  }

  const result = await markEnrollmentPaid({
    invoiceNo: parsed.data.invoiceNo,
    eventId: `mock-paid-${parsed.data.invoiceNo}`,
    provider: "mock",
    reference: `MOCK-${parsed.data.invoiceNo}`,
    payload: { simulated: true, channel: "mock-gateway" },
  });

  if (result.status === "not-found") {
    return Response.json({ error: "Invoice tidak ditemukan" }, { status: 404 });
  }

  return Response.json({ status: result.status });
}
