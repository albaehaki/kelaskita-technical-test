"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getStudentEmail } from "@/lib/student-auth";

/**
 * Tandai / batalkan penyelesaian satu modul.
 * Kepemilikan diverifikasi di server: enrollment harus milik email di session
 * dan berstatus PAID, serta modul harus bagian dari kelas tersebut.
 */
export async function toggleLessonAction(enrollmentId: string, lessonId: string) {
  const email = await getStudentEmail();
  if (!email) redirect("/kelas-saya");

  const enrollment = await prisma.enrollment.findFirst({
    where: { id: enrollmentId, email, status: "PAID" },
    include: { course: true },
  });
  if (!enrollment) throw new Error("Akses ditolak");

  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId, courseId: enrollment.courseId },
    select: { id: true },
  });
  if (!lesson) throw new Error("Modul tidak valid");

  const existing = await prisma.lessonProgress.findUnique({
    where: { enrollmentId_lessonId: { enrollmentId, lessonId } },
  });

  if (existing) {
    await prisma.lessonProgress.delete({ where: { id: existing.id } });
  } else {
    await prisma.lessonProgress.create({ data: { enrollmentId, lessonId } });
  }

  revalidatePath("/kelas-saya");
  revalidatePath(`/kelas-saya/${enrollment.course.slug}`);
}
