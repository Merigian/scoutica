import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  switch (session.user.role) {
    case "MODEL":
      redirect("/model/home");
    case "SCOUT":
      redirect("/scout/home");
    case "STUDIO":
      redirect("/studio/studios");
    case "ADMIN":
      redirect("/admin");
    default:
      redirect("/login");
  }
}
