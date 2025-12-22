import NotificationList from "@/features/notification/ui/notification-list";

export default async function NotifikasiPage() {
  return (
    <div>
      <h2 className="mb-5 text-3xl font-medium tracking-tight">Notifikasi</h2>

      <NotificationList />
    </div>
  );
}
