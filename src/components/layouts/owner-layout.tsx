import { auth } from "@/config/auth";
import { redirect } from "next/navigation";
import OwnerTopbar from "./owner-topbar";
import OwnerBottomBar from "./owner-bottombar";

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login-kedai");
  }

  return (
    <div className="relative">
      <OwnerTopbar shopName="Kedai Cawan" />

      <div className="p-5 pt-24">{children}</div>

      <OwnerBottomBar />
    </div>
  );
}
