import { prisma } from "@/lib/db";

export async function GET() {
  const courses = await prisma.course.findMany({
    where: { published: true },
    include: { category: true },
    orderBy: { createdAt: "asc" },
  });

  return Response.json({
    data: courses.map((course) => ({
      id: course.id,
      slug: course.slug,
      title: course.title,
      summary: course.summary,
      level: course.level,
      price: course.price,
      durationHours: course.durationHours,
      category: course.category.name,
    })),
    meta: { total: courses.length },
  });
}
