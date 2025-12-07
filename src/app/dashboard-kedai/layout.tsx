// import AdminLayout from "@/components/admin-layout";
import { auth } from "@/config/auth";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  return (
    <div className="relative">
      {/* <AdminLayout></AdminLayout> */}
      {children}
    </div>
  );
}
