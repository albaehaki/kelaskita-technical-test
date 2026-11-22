import { z } from "zod";
import { prisma } from "@/lib/db";
import { getPaymentProvider } from "@/lib/payment";
import { createEnrollment } from "@/lib/enrollment-service";
import { emitEventToN8n } from "@/lib/n8n";

const bodySchema = z.object({
  courseId: z.string().min(1),
  studentName: z.string().min(2, "Nama minimal 2 karakter").max(80),
  email: z.string().email("Email tidak valid"),
  phone: z.string().min(9, "Nomor HP tidak valid").max(20),
  province: z.string().min(2),
  city: z.string().min(2),
  note: z.string().max(300).optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Body harus JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Data pendaftaran tidak valid", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const data = parsed.data;

  try {
    const enrollment = await createEnrollment(data);

    const provider = getPaymentProvider();
    const payment = await provider.createPayment({
      invoiceNo: enrollment.invoiceNo,
      amount: enrollment.amount,
      itemName: enrollment.course.title,
      customer: {
        name: enrollment.studentName,
        email: enrollment.email,
        phone: enrollment.phone,
      },
    });

    await prisma.payment.create({
      data: {
        enrollmentId: enrollment.id,
        provider: payment.provider,
        reference: payment.reference,
        amount: enrollment.amount,
        status: "PENDING",
      },
    });

    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { status: "PENDING" },
    });

    await emitEventToN8n({
      event: "order.created",
      invoiceNo: enrollment.invoiceNo,
      studentName: enrollment.studentName,
      email: enrollment.email,
      phone: enrollment.phone,
      courseTitle: enrollment.course.title,
      amount: enrollment.amount,
      province: enrollment.province,
      city: enrollment.city,
      occurredAt: new Date().toISOString(),
    });

    return Response.json(
      {
        invoiceNo: enrollment.invoiceNo,
        redirectUrl: payment.redirectUrl,
        provider: payment.provider,
        amount: enrollment.amount,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[checkout]", error);
    const message = error instanceof Error ? error.message : "Gagal membuat pendaftaran";
    return Response.json({ error: message }, { status: 500 });
  }
}
