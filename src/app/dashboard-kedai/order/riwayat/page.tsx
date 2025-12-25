import { auth } from "@/config/auth";
import { getShopOrderHistory } from "@/features/order/lib/order-queries";
import { formatRupiah } from "@/helper/format-rupiah";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

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

export default async function OrderHistoryPage() {
  const session = await auth();

  if (!session || !session.user.shopId) {
    redirect("/login-kedai");
  }

  const orderHistory = await getShopOrderHistory(session.user.shopId);

  return (
    <div>
      <Link
        href={"/dashboard-kedai/order"}
        className="flex gap-1 text-muted-foreground text-sm mb-4 items-center"
      >
        <ChevronLeft className="w-4 h-4" /> Kembali
      </Link>

      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Riwayat Order</h1>
        <p className="text-sm text-gray-500">
          Daftar transaksi yang telah selesai
        </p>
      </div>

      {orderHistory.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed">
          <p className="text-gray-500 text-sm">Belum ada riwayat order.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orderHistory.map((order, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                    {formatDate(order.created_at)}
                  </p>
                  <h3 className="font-bold text-gray-800 mt-1">
                    {order.customer.user.name}
                  </h3>
                </div>
                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded uppercase">
                  Selesai
                </span>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Pembayaran</span>
                <span className="text-lg font-bold text-orange-600">
                  {formatRupiah(order.total_price)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
