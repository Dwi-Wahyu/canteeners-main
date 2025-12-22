import OwnerLayout from "@/components/layouts/owner-layout";
import { auth } from "@/config/auth";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login-kedai");
  }

  if (session.user.role !== "SHOP_OWNER") {
    redirect("/");
  }

  return (
    <OwnerLayout
      uid={session.user.id}
      avatar={session.user.avatar}
      shopName={session.user.shopName ?? "Belum Ada Nama Kedai"}
    >
      {children}
    </OwnerLayout>
  );
}
