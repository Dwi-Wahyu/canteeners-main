import HistoryBackButton from "@/components/layouts/history-back-button";
import NavButton from "@/components/nav-button";
import { Skeleton } from "@/components/ui/skeleton";
import { auth } from "@/config/auth";
import { getCanteenIncludeMaps } from "@/features/canteen/lib/canteen-queries";
import ChooseTableClient from "@/features/canteen/ui/choose-table-client";
import { getCustomerSelectedTable } from "@/features/user/lib/user-queries";
import { ChevronLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

export default async function ChooseTablePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const canteen = await getCanteenIncludeMaps(slug);

  if (!canteen) {
    return notFound();
  }

  const session = await auth();

  // untuk saat ini redirect saja
  if (!session) {
    redirect("/kantin/kantin-kudapan");
  }

  const customerProfile = await getCustomerSelectedTable(
    session?.user.customerId!
  );

  return (
    <div>
      <div className="w-full p-4 gap-2 flex items-center bg-linear-to-r text-primary-foreground from-primary to-primary/90">
        <HistoryBackButton />

        <h1 className="text-xl leading-tight">Pilih Meja </h1>
      </div>

      <div className="p-5">
        <h1 className="font-semibold text-lg">{canteen.name}</h1>
        <Suspense
          fallback={
            <div className="flex flex-col gap-4">
              <Skeleton className="w-full h-40" />

              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="w-full h-10" />
                <Skeleton className="w-full h-10" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="w-full h-7" />
                <Skeleton className="w-full h-7" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="w-full h-7" />
                <Skeleton className="w-full h-7" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="w-full h-7" />
                <Skeleton className="w-full h-7" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="w-full h-7" />
                <Skeleton className="w-full h-7" />
              </div>
            </div>
          }
        >
          <ChooseTableClient
            canteen={canteen}
            customer_id={session?.user.customerId!}
            defaultSelectedTable={
              customerProfile
                ? {
                    floor: customerProfile.floor || 1,
                    table_number: customerProfile.table_number || 1,
                  }
                : null
            }
          />
        </Suspense>
      </div>
    </div>
  );
}
