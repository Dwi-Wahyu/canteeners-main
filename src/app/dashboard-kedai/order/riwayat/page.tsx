import { auth } from "@/config/auth";
import { getShopOrderHistory } from "@/features/order/lib/order-queries";
import { formatRupiah } from "@/helper/format-rupiah";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import OrderHistoryFilters from "./order-history-filters";
import { startOfDay, endOfDay, startOfWeek, startOfMonth } from "date-fns";
import CustomBadge from "@/components/custom-badge";
import { OrderStatus } from "@/generated/prisma";
import { orderStatusMapping } from "@/constant/order-status-mapping";
import OrderHistoryPagination from "./order-history-pagination";

// Fungsi helper untuk format tanggal
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

export default async function OrderHistoryPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const session = await auth();

  if (!session || !session.user.shopId) {
    redirect("/login-kedai");
  }

  const status = searchParams.status as string | undefined;
  const search = searchParams.search as string | undefined;
  const dateFilter = searchParams.date as string | undefined;
  const page = parseInt((searchParams.page as string) || "1");

  let startDate: Date | undefined;
  let endDate: Date | undefined;

  if (dateFilter === "TODAY") {
    startDate = startOfDay(new Date());
    endDate = endOfDay(new Date());
  } else if (dateFilter === "WEEK") {
    startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
  } else if (dateFilter === "MONTH") {
    startDate = startOfMonth(new Date());
  }

  const {
    data: orderHistory,
    totalPages,
    currentPage,
  } = await getShopOrderHistory(session.user.shopId, {
    status,
    search,
    startDate,
    endDate,
    page,
    limit: 10,
  });

  return (
    <div className="p-5">
      <Link
        href={"/dashboard-kedai/order"}
        className="flex gap-1 text-muted-foreground text-sm mb-4 items-center"
      >
        <ChevronLeft className="w-4 h-4" /> Kembali
      </Link>

      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">Riwayat Order</h1>
        <p className="text-sm text-gray-500">Daftar transaksi kedai Anda</p>
      </div>

      <OrderHistoryFilters />

      {orderHistory.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed">
          <p className="text-gray-500 text-sm">Belum ada riwayat order.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {orderHistory.map((order, index) => (
              <Link
                key={index}
                href={`/dashboard-kedai/order/${order.id}?back_url=/dashboard-kedai/order/riwayat`}
                className="block bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                      {formatDate(order.created_at)}
                    </p>
                    <h3 className="font-bold text-gray-800 mt-1">
                      {order.customer.user.name}
                    </h3>
                  </div>
                  <CustomBadge
                    value={order.status}
                    successValues={[OrderStatus.COMPLETED]}
                    destructiveValues={[
                      OrderStatus.CANCELLED,
                      OrderStatus.REJECTED,
                    ]}
                    className="text-[10px] uppercase font-bold px-2 py-1 h-fit"
                  >
                    {orderStatusMapping[order.status]}
                  </CustomBadge>
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Total Pembayaran
                  </span>
                  <span className="text-lg font-bold text-orange-600">
                    {formatRupiah(order.total_price)}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <OrderHistoryPagination
            totalPages={totalPages}
            currentPage={currentPage}
          />
        </>
      )}
    </div>
  );
}
