import { auth } from "@/config/auth";

export default async function DashboardKedai() {
  const session = await auth();

  return (
    <div>
      <h1>Dashboard kedai</h1>

      <h1>{session?.user.firebaseToken ? "sudah ada firebase token" : "belum ada firebase token"}</h1>

      <h1>Selamat datang {session?.user.name}</h1>
    </div>
  );
}
