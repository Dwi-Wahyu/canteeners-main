import NavButton from "@/components/nav-button";
import { auth } from "@/config/auth";
import { getCanteenIncludeMaps } from "@/features/canteen/lib/canteen-queries";
import ChooseTableClient from "@/features/canteen/ui/choose-table-client";
import { getCustomerSelectedTable } from "@/features/user/lib/user-queries";
import { ChevronLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";

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
        <NavButton size="icon" variant="ghost" href="/keranjang">
          <ChevronLeft />
        </NavButton>

        <h1 className="text-xl leading-tight">Pilih Meja </h1>
      </div>

      <div className="p-5">
        <h1 className="font-semibold text-lg">{canteen.name}</h1>
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
      </div>
    </div>
  );
}
