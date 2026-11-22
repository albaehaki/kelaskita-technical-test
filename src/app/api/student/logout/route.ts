import { destroyStudentSession } from "@/lib/student-auth";
import { redirect } from "next/navigation";

export async function POST() {
  await destroyStudentSession();
  redirect("/kelas-saya");
}
