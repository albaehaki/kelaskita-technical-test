import { z } from "zod";
import { prisma } from "@/lib/db";
import { markEnrollmentPaid } from "@/lib/enrollment-service";

/**
 * Endpoint callback payment gateway.
 *
 * Kontrak:
 *   POST /api/payments/webhook
 *   header x-callback-token: <PAYMENT_CALLBACK_TOKEN>
 *   body { eventId, invoiceNo, status: "PAID"|"FAILED"|"EXPIRED", reference?, provider? }
 *
 * Idempotensi dijaga tabel WebhookEvent (eventId unik) — retry provider
 * dengan eventId yang sama tidak akan menambah data atau mengirim notifikasi ganda.
 */

const schema = z.object({
  eventId: z.string().min(3),
  invoiceNo: z.string().min(3),
  status: z.enum(["PAID", "FAILED", "EXPIRED"]),
  reference: z.string().optional(),
  provider: z.string().optional(),
});

export async function POST(request: Request) {
  const token = request.headers.get("x-callback-token");
  const expected = process.env.PAYMENT_CALLBACK_TOKEN;

  if (!expected || token !== expected) {
    return Response.json({ error: "Token callback tidak valid" }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Payload tidak valid" }, { status: 422 });
  }

  const { eventId, invoiceNo, status, reference, provider } = parsed.data;

  if (status === "PAID") {
    const result = await markEnrollmentPaid({
      invoiceNo,
      eventId,
      reference,
      provider: provider ?? "gateway",
      payload: parsed.data,
    });

    if (result.status === "not-found") {
      return Response.json({ error: "Invoice tidak ditemukan" }, { status: 404 });
    }

    return Response.json({ received: true, result: result.status });
  }

  // Status gagal/kedaluwarsa — tetap idempotent.
  const already = await prisma.webhookEvent.findUnique({ where: { eventId } });
  if (already) return Response.json({ received: true, result: "duplicate" });

  await prisma.$transaction(async (tx) => {
    await tx.webhookEvent.create({
      data: { eventId, source: provider ?? "gateway", payload: parsed.data },
    });
    await tx.enrollment.updateMany({
      where: { invoiceNo, status: "PENDING" },
      data: { status: status === "EXPIRED" ? "EXPIRED" : "CANCELLED" },
    });
    await tx.payment.updateMany({
      where: { enrollment: { invoiceNo } },
      data: { status: status === "EXPIRED" ? "EXPIRED" : "FAILED" },
    });
  });

  return Response.json({ received: true, result: "updated" });
}
