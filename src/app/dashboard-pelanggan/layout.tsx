import { auth } from "@/config/auth";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login-pelanggan");
  }

  if (session.user.role !== "CUSTOMER") {
    redirect("/");
  }

  return <div>{children}</div>;
}
