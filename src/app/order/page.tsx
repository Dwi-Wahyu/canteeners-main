import { auth } from "@/config/auth";
import { getCustomerOrderHistory } from "@/features/order/lib/order-queries";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { getImageUrl } from "@/helper/get-image-url";
import { formatRupiah } from "@/helper/format-rupiah";
import { formatDateToYYYYMMDD } from "@/helper/date-helper";
import { orderStatusMapping } from "@/constant/order-status-mapping";
import { BottomNav } from "@/components/layouts/bottom-nav";
import Link from "next/link";
import CustomBadge from "@/components/custom-badge";
import { ShoppingBag } from "lucide-react";
import CustomerOrderFilters from "@/features/order/ui/customer-order-filters";
import OrderPagination from "@/features/order/ui/order-pagination";

export default async function OrderHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  const params = await searchParams;

  const page = Number(params.page) || 1;
  const startDate = params.startDate
    ? new Date(params.startDate as string)
    : undefined;
  const endDate = params.endDate
    ? new Date(params.endDate as string)
    : undefined;

  let orders: any[] = [];
  let totalPages = 0;
  let currentPage = 1;

  if (session?.user.customerId) {
    const result = await getCustomerOrderHistory(session.user.customerId, {
      page,
      startDate,
      endDate,
      limit: 10,
    });
    orders = result.data;
    totalPages = result.totalPages;
    currentPage = result.currentPage;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <main className="max-w-md mx-auto p-5 space-y-6">
        {/* Header Section */}
        {/* <div className="pt-2">
          <h1 className="text-2xl font-bold text-gray-900">Riwayat Pesanan</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pantau status dan riwayat kulineranmu
          </p>
        </div> */}

        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900">Riwayat Pesanan</h1>
          <div className="text-sm text-gray-500">
            Pantau status dan riwayat kulineranmu
          </div>
        </div>

        {/* Filters */}
        <CustomerOrderFilters />

        {/* Order List */}
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="p-6 bg-gray-100 rounded-full">
                <ShoppingBag className="size-12 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Belum ada pesanan
                </h3>
                <p className="text-sm text-muted-foreground px-10">
                  Sepertinya kamu belum pesan apa-apa. Yuk, cari makanan enak
                  sekarang!
                </p>
              </div>
              <Link
                href="/kantin/kantin-kudapan"
                className="px-6 py-2 bg-primary text-white rounded-full font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
              >
                Mulai Belanja
              </Link>
            </div>
          ) : (
            orders.map((order) => (
              <Link key={order.id} href={`/order/${order.id}?backUrl=/order`}>
                <Card className="overflow-hidden mb-4 hover:shadow-md transition-shadow active:scale-[0.98] border-none shadow-sm">
                  <CardContent>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="relative size-12 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                          <img
                            src={getImageUrl("/shop/" + order.shop.image_url)}
                            alt={order.shop.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div>
                          <h2 className="font-bold text-gray-900 leading-tight">
                            {order.shop.name}
                          </h2>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5">
                            {formatDateToYYYYMMDD(order.created_at)}
                          </p>
                        </div>
                      </div>
                      <CustomBadge
                        value={order.status}
                        successValues={["COMPLETED"]}
                        destructiveValues={[
                          "REJECTED",
                          "CANCELLED",
                          "PAYMENT_REJECTED",
                        ]}
                        outlineValues={[
                          "PENDING_CONFIRMATION",
                          "WAITING_PAYMENT",
                        ]}
                      >
                        {
                          orderStatusMapping[
                            order.status as keyof typeof orderStatusMapping
                          ]
                        }
                      </CustomBadge>
                    </div>

                    <div className="border-t border-dashed border-gray-100 pt-3 flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">
                          {order.order_items.length} item •{" "}
                          {order.order_items[0]?.product.name}
                          {order.order_items.length > 1 &&
                            ` +${order.order_items.length - 1} lainnya`}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-primary">
                            {formatRupiah(order.total_price)}
                          </p>
                          {(order as any).total_discount_amount > 0 && (
                            <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md font-bold">
                              Hemat{" "}
                              {formatRupiah(
                                (order as any).total_discount_amount,
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>

        {/* Pagination */}
        <OrderPagination totalPages={totalPages} currentPage={currentPage} />
      </main>

      <BottomNav />
    </div>
  );
}
