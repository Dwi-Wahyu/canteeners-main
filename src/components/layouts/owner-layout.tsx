"use client";

import { usePathname } from "next/navigation";
import OwnerTopbar from "./owner-topbar";
import OwnerBottomBar from "./owner-bottombar";
import { Toaster } from "@/components/ui/sonner";
import { useWatchChatNotification } from "@/features/notification/hooks/use-watch-chat-notification";

export default function OwnerLayout({
  children,
  avatar,
  shopName,
  uid,
}: {
  children: React.ReactNode;
  avatar: string;
  shopName: string;
  uid: string;
}) {
  const pathname = usePathname();

  const excludedPath = [
    "pengajuan-refund",
    "/chat/",
    "order",
    "/ulasan-pelanggan",
    "/pengaturan/",
    "/produk/",
    "metode-pembayaran",
  ];

  function isExcluded() {
    return excludedPath.some((path) => pathname.includes(path));
  }

  const isChatPage = pathname.includes("/chat/");

  useWatchChatNotification(isChatPage ? null : uid);

  return (
    <div>
      <Toaster />

      {isExcluded() ? (
        <div className="">{children}</div>
      ) : (
        <div className="relative">
          <OwnerTopbar shopName={shopName} avatar={avatar} />

          <div className="p-5 pt-24 pb-24">{children}</div>

          <OwnerBottomBar />
        </div>
      )}
    </div>
  );
}
