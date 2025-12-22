import { auth } from "@/config/auth";

export default async function DashboardKedai() {
  const session = await auth();

  return (
    <div>
      <h1>Dashboard kedai</h1>
    </div>
  );
}
