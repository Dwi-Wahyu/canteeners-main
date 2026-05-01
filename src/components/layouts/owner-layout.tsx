"use client";

import { usePathname } from "next/navigation";
import OwnerTopbar from "./owner-topbar";
import OwnerBottomBar from "./owner-bottombar";

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
    "/ulasan-pelanggan",
    "/pengaturan/",
    "/produk/",
    "metode-pembayaran",
  ];

  function isExcluded() {
    return excludedPath.some((path) => pathname.includes(path));
  }

  return (
    <div>
      {isExcluded() ? (
        <div className="">{children}</div>
      ) : (
        <div className="relative">
          {/* <OwnerTopbar avatar={avatar} shopName={shopName} /> */}

          <div className="p-5 pb-24">{children}</div>

          <OwnerBottomBar />
        </div>
      )}
    </div>
  );
}
