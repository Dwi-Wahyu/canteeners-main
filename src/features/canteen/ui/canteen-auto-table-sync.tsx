"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Session } from "next-auth";
import { chooseCustomerTable } from "@/features/user/lib/user-actions";
import { createGuestSession } from "@/helper/create-guest-session";
import { toast } from "sonner";

export function CanteenAutoTableSync({
  session,
  canteenId,
}: {
  session: Session | null;
  canteenId: number;
}) {
  const searchParams = useSearchParams();
  const hasSynced = useRef(false);

  useEffect(() => {
    if (hasSynced.current) return;

    const floor = searchParams.get("floor");
    const tableNumber = searchParams.get("table_number");

    if (floor && tableNumber) {
      const floorInt = parseInt(floor);
      const tableInt = parseInt(tableNumber);

      if (isNaN(floorInt) || isNaN(tableInt)) return;

      const syncTable = async () => {
        try {
          const tableData = {
            canteen_id: canteenId,
            floor: floorInt,
            table_number: tableInt,
          };

          if (!session) {
            // Jika belum ada session, buat guest session dengan data meja
            await createGuestSession({ 
              name: "",
              tableData
            });
            // createGuestSession akan trigger signIn yang melakukan page reload
          } else if (session.user.customerId) {
            // Jika sudah ada session, update data meja customer
            const result = await chooseCustomerTable({
              customer_id: session.user.customerId,
              ...tableData
            });

            if (result.success) {
              toast.success(`Meja ${tableInt} di lantai ${floorInt} terpilih otomatis`);
            }
          }
        } catch (error) {
          console.error("Auto table sync error:", error);
        }
      };

      syncTable();
      hasSynced.current = true;
    }
  }, [searchParams, session, canteenId]);

  return null;
}
