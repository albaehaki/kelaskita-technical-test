import { z } from "zod";
import { pushNotification } from "@/lib/n8n";

const schema = z.object({
  type: z.string().min(2),
  title: z.string().min(2),
  body: z.string().min(2),
});

/** Callback dari n8n setelah workflow selesai (kirim WA/Telegram, dsb). */
export async function POST(request: Request) {
  const secret = request.headers.get("x-internal-secret");
  if (!process.env.INTERNAL_SECRET || secret !== process.env.INTERNAL_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Payload tidak valid" }, { status: 422 });
  }

  const notification = await pushNotification({ ...parsed.data, source: "n8n" });
  return Response.json({ ok: true, id: notification.id }, { status: 201 });
}
