import { prisma } from "./db";
import { emitEventToN8n } from "./n8n";

type MarkPaidInput = {
  invoiceNo: string;
  eventId: string;
  provider?: string;
  reference?: string;
  payload?: unknown;
};

/**
 * Satu-satunya pintu untuk mengubah status pendaftaran menjadi PAID.
 * Dipakai oleh mock gateway maupun webhook provider sungguhan, supaya
 * aturan idempotensi & efek samping (notifikasi + automation) konsisten.
 */
export async function markEnrollmentPaid(input: MarkPaidInput) {
  const already = await prisma.webhookEvent.findUnique({
    where: { eventId: input.eventId },
  });
  if (already) return { status: "duplicate" as const };

  const enrollment = await prisma.enrollment.findUnique({
    where: { invoiceNo: input.invoiceNo },
    include: { course: true, payment: true },
  });

  if (!enrollment) return { status: "not-found" as const };

  if (enrollment.status === "PAID") {
    // Catat event walau sudah lunas, supaya retry provider tidak diproses ulang.
    await prisma.webhookEvent
      .create({
        data: {
          eventId: input.eventId,
          source: input.provider ?? "unknown",
          payload: (input.payload ?? {}) as object,
        },
      })
      .catch(() => undefined);
    return { status: "already-paid" as const, enrollment };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.webhookEvent.create({
        data: {
          eventId: input.eventId,
          source: input.provider ?? "unknown",
          payload: (input.payload ?? {}) as object,
        },
      });

      await tx.enrollment.update({
        where: { id: enrollment.id },
        data: { status: "PAID", paidAt: new Date() },
      });

      if (enrollment.payment) {
        await tx.payment.update({
          where: { id: enrollment.payment.id },
          data: {
            status: "PAID",
            paidAt: new Date(),
            reference: input.reference ?? enrollment.payment.reference,
            rawCallback: (input.payload ?? {}) as object,
          },
        });
      }

      await tx.notification.create({
        data: {
          type: "order.paid",
          title: `Pembayaran lunas — ${input.invoiceNo}`,
          body: `${enrollment.studentName} membayar ${enrollment.course.title}.`,
          source: input.provider ?? "payment",
        },
      });
    });
  } catch (error) {
    // Unique constraint = callback ganda yang datang bersamaan.
    if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
      return { status: "duplicate" as const };
    }
    throw error;
  }

  // Automation di luar transaksi: kegagalan n8n tidak membatalkan pembayaran.
  await emitEventToN8n({
    event: "order.paid",
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

  return { status: "paid" as const, enrollment };
}

export async function createEnrollment(input: {
  courseId: string;
  studentName: string;
  email: string;
  phone: string;
  province: string;
  city: string;
  note?: string;
}) {
  const course = await prisma.course.findUnique({ where: { id: input.courseId } });
  if (!course || !course.published) throw new Error("Kelas tidak ditemukan");

  const { invoiceNo } = await import("./format");
  const nomor = invoiceNo();

  const enrollment = await prisma.enrollment.create({
    data: {
      invoiceNo: nomor,
      studentName: input.studentName,
      email: input.email,
      phone: input.phone,
      province: input.province,
      city: input.city,
      note: input.note,
      amount: course.price,
      courseId: course.id,
    },
    include: { course: true },
  });

  return enrollment;
}
