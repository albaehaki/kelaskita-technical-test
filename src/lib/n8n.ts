import { prisma } from "./db";

/**
 * Automation layer — jembatan ke n8n.
 *
 * Alur: domain event (order.created / order.paid) -> webhook n8n -> n8n
 * memperkaya & meneruskan (WA/Telegram/Sheets) -> callback ke
 * /api/internal/notifications -> tersimpan di tabel Notification (tampil di CMS).
 *
 * Kalau N8N_WEBHOOK_URL kosong (mis. reviewer belum import workflow),
 * event tetap dicatat lokal supaya aplikasi tidak pernah gagal karena automation.
 */

export type AutomationEvent = {
  event: "order.created" | "order.paid";
  invoiceNo: string;
  studentName: string;
  email: string;
  phone: string;
  courseTitle: string;
  amount: number;
  province: string;
  city: string;
  occurredAt: string;
};

export async function emitEventToN8n(payload: AutomationEvent) {
  const url = process.env.N8N_WEBHOOK_URL?.trim();

  if (!url) {
    await prisma.notification.create({
      data: {
        type: payload.event,
        title: `[lokal] ${payload.event}`,
        body: `${payload.studentName} — ${payload.courseTitle} (${payload.invoiceNo})`,
        source: "app-fallback",
      },
    });
    return { forwarded: false, reason: "N8N_WEBHOOK_URL kosong" };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5_000),
    });

    return { forwarded: res.ok, reason: res.ok ? "ok" : `HTTP ${res.status}` };
  } catch (error) {
    // Automation tidak boleh menggagalkan transaksi user.
    console.error("[n8n] gagal kirim event:", error);
    return { forwarded: false, reason: "network error" };
  }
}

export async function pushNotification(input: {
  type: string;
  title: string;
  body: string;
  source?: string;
}) {
  return prisma.notification.create({
    data: {
      type: input.type,
      title: input.title,
      body: input.body,
      source: input.source ?? "n8n",
    },
  });
}
