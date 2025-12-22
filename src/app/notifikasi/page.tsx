import NotificationList from "@/features/notification/ui/notification-list";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function NotificationPage() {
  return (
    <div>
      <div className="p-4 flex items-center gap-2 justify-between bg-primary sticky top-0 z-10 text-primary-foreground">
        <div className="flex gap-2 items-center">
          <Link href={"/chat"}>
            <ChevronLeft />
          </Link>
          <h1 className="text-xl font-semibold">Notifikasi</h1>
        </div>
      </div>

      <div className="p-4">
        <NotificationList />
      </div>
    </div>
  );
}
