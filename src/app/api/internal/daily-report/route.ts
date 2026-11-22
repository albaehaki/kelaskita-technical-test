import { prisma } from "@/lib/db";

/**
 * Dipanggil workflow n8n "Daily Report" (Schedule Trigger 07:00).
 * Dijaga shared secret supaya tidak bisa diakses publik.
 */
export async function GET(request: Request) {
  const secret = request.headers.get("x-internal-secret");
  if (!process.env.INTERNAL_SECRET || secret !== process.env.INTERNAL_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [paidToday, pending, revenue, topCourse] = await Promise.all([
    prisma.enrollment.count({ where: { status: "PAID", paidAt: { gte: startOfDay } } }),
    prisma.enrollment.count({ where: { status: "PENDING" } }),
    prisma.enrollment.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
    }),
    prisma.course.findFirst({
      orderBy: { enrollments: { _count: "desc" } },
      select: { title: true, _count: { select: { enrollments: true } } },
    }),
  ]);

  return Response.json({
    date: new Date().toISOString().slice(0, 10),
    paidToday,
    pending,
    totalRevenue: revenue._sum.amount ?? 0,
    topCourse: topCourse?.title ?? null,
    topCourseEnrollments: topCourse?._count.enrollments ?? 0,
  });
}
