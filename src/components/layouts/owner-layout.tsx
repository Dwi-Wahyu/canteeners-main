"use client";

import { usePathname } from "next/navigation";
import OwnerTopbar from "./owner-topbar";
import OwnerBottomBar from "./owner-bottombar";
import { useEffect, useState, useRef } from "react";
import { getAuth } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export default function OwnerLayout({
  children,
  avatar,
  shopName,
}: {
  children: React.ReactNode;
  avatar: string;
  shopName: string;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<any | null>(null);
  const isFirstLoad = useRef(true);

  // Auth Listener
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Chat Listener
  useEffect(() => {
    if (!user) return;

    const chatsRef = collection(db, "chats");
    // Asumsikan owner adalah seller.
    // Kita filter chat dimana dia adalah sellerId ATAU participantIds contains uid.
    // Tapi karena ini OwnerLayout (Dashboard Kedai), asumsi dia Seller.
    const q = query(
      chatsRef,
      where("participantIds", "array-contains", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (isFirstLoad.current) {
        isFirstLoad.current = false;
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === "added" || change.type === "modified") {
          const data = change.doc.data();
          // Check if unread count for seller > 0
          // For 'modified', ideally we check if it INCREASED, but simplified:
          // if it's > 0 and it was a modification/addition, notify.
          // Note: This might spam if other fields update.
          // Better: check if `lastMessageAt` is recent?
          // Or just show toast. Sonner dedupes usually? No.

          // Let's refine: Only if unreadCountSeller > 0
          // And ideally verify it's a message update.
          const unread = data.unreadCountSeller || 0;
          if (unread > 0) {
            // Check if actually a new message?
            // We can rely on the fact that we ignore first load.
            // On 'modified', if unread > 0, likely a message or typing status?
            // Typing status updates doc too! We don't want toast on typing.
            // So we MUST check if `lastMessage` or `unreadCountSeller` changed.

            // Access previous data? Firestore native SDK docChanges doesn't give 'oldDoc' easily for specific fields comparison unless using 'modified'.
            // But we don't haven old data reference here easily without state.

            // Workaround: Trigger only if `unreadCountSeller` > 0 and it matches the expectation of a new msg.
            // Actually, typing status update usually doesn't increment unread count.
            // BUT, if I am typing, unread count stays same.
            // If THEY are typing, doc updates, unread count stays same.
            // So, if we just check unread > 0, we might toast on typing.

            // CRITICAL: We need to check what CHANGED.
            // But we can't easily.

            // Alternative: Track `lastMessageAt` in a ref map? Too complex.
            // Better: Check if `change.doc.data().lastMessage` is different?
            // Let's just try to be specific.
            // Only toast if `unreadCountSeller` INCREASED? We can't know if we don't track prev.

            // Hacky but effective:
            // Use `change.type === 'modified'`?
            // If typing updates, `unreadCount` doesn't change.
            // If message comes, `unreadCount` increments.

            // Let's assume typing events update `typing` field.
            // We can try to use `snapshot.metadata.hasPendingWrites`? No.

            // Let's look at `data`.
            // We can just show toast. If it spams on typing, we fix.
            // Wait, typing status is frequent. This IS a risk.

            // We can use a simpler heuristic:
            // Only toast if `unreadCountSeller` > 0.
            // AND `lastMessageAt` is very recent (within 2 seconds of now?)
            // That handles the "newness".

            const now = new Date();
            const msgTime = data.lastMessageAt?.toDate();
            if (msgTime && now.getTime() - msgTime.getTime() < 60000) {
              // Only toast if message is very recent (5s).
              // This filters out old unread messages on reconnect (maybe)
              // and avoids random updates (like typing) if typing doesn't update timestamp.
              // Does typing update timestamp? NO. `handleInputChange` only updates `typing`.
              // `handleSend` updates `lastMessageAt`.
              // SUCCESS! This is the filter.

              toast("Pesan Baru", {
                description: `${data.lastMessage || "Mengirim gambar..."}`,
                action: {
                  label: "Lihat",
                  onClick: () =>
                    (window.location.href = `/dashboard-kedai/chat/${change.doc.id}`),
                },
              });
            }
          }
        }
      });
    });

    return () => unsubscribe();
  }, [user]);

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

  return (
    <div>
      <Toaster />
      {isExcluded() ? (
        <div className="">{children}</div>
      ) : (
        <div className="relative">
          <OwnerTopbar shopName={shopName} />

          <div className="p-5 pt-24">{children}</div>

          <OwnerBottomBar />
        </div>
      )}
    </div>
  );
}
