import { auth } from "@/config/auth";

export default async function NotifikasiPage() {
  const session = await auth();
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Notifikasi</h2>
      <p className="text-muted-foreground">Belum ada notifikasi.</p>
    </div>
  );
}
