import { z } from "zod";
import { prisma } from "@/lib/db";
import { createStudentSession } from "@/lib/student-auth";

const schema = z.object({
  email: z.string().email(),
  invoiceNo: z.string().min(3),
});

/**
 * Login peserta: email + nomor invoice yang statusnya PAID.
 * Tidak memakai password karena bukti kepemilikan = invoice transaksi.
 */
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Email dan nomor invoice wajib diisi" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      invoiceNo: parsed.data.invoiceNo.trim().toUpperCase(),
      email,
      status: "PAID",
    },
    select: { id: true, studentName: true },
  });

  if (!enrollment) {
    return Response.json(
      { error: "Invoice tidak ditemukan atau belum lunas untuk email tersebut." },
      { status: 401 }
    );
  }

  await createStudentSession(email);
  return Response.json({ ok: true, name: enrollment.studentName });
}
