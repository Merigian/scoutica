import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AccountScreen } from "@/components/layout/account-screen";

export default async function StudioAccountPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDIO") redirect("/login");

  return <AccountScreen />;
}
