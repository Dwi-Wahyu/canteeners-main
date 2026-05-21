import NotificationList from "@/features/notification/ui/notification-list";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/dist/client/link";
import { ChevronLeft } from "lucide-react";
import { DeleteAllNotificationsButton } from "@/features/notification/components/delete-all-notifications-button";

export default async function NotifikasiPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Link
          href={"/dashboard-kedai"}
          className="flex gap-1 text-muted-foreground text-sm items-center"
        >
          <ChevronLeft className="w-4 h-4" /> Kembali
        </Link>
        <DeleteAllNotificationsButton />
      </div>

      <div className="mb-4">
        <h2 className="text-2xl font-medium tracking-tight">Notifikasi</h2>
        <div className="text-muted-foreground">
          Lihat notifikasi terbaru dan riwayat pelaporan
        </div>
      </div>

      <Suspense
        fallback={
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          </div>
        }
      >
        <NotificationList />
      </Suspense>
    </div>
  );
}
