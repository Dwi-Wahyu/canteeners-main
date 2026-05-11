import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getRecentOrdersByShop } from "@/features/order/lib/order-queries";
import { formatRupiah } from "@/helper/format-rupiah";
import { orderStatusMapping } from "@/constant/order-status-mapping";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatToHour } from "@/helper/hour-helper";

type RecentOrdersListProps = {
  orders: Awaited<ReturnType<typeof getRecentOrdersByShop>>;
};

export default function RecentOrdersList({ orders }: RecentOrdersListProps) {
  return (
    <Card className="col-span-4 lg:col-span-3">
      <CardHeader>
        <CardTitle>Pesanan Terbaru</CardTitle>
        <CardDescription>
          {orders.length > 0
            ? `Daftar ${orders.length} pesanan terakhir yang masuk.`
            : "Belum ada pesanan terbaru."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              className="block"
              href={`/dashboard-kedai/order/${order.id}?back_url=/dashboard-kedai`}
            >
              <div
                className={cn(
                  "w-full border rounded-lg px-4 py-3 transition-colors",
                  order.status === "COMPLETED"
                    ? "bg-green-100 border-green-200 dark:bg-green-900/40 dark:border-green-800"
                    : "bg-card",
                )}
              >
                <div className="flex items-start w-full justify-between">
                  {/* ... (avatar comment remains unchanged) */}

                  <div className="space-y-1">
                    <p className="font-medium leading-none">
                      {order.customer.user.name}
                    </p>
                    <span className="text-[10px] text-muted-foreground">
                      {formatToHour(order.created_at)}
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <div
                      className={cn(
                        "font-medium text-sm",
                        order.status === "COMPLETED" &&
                          "text-green-600 dark:text-green-400",
                      )}
                    >
                      {order.status === "COMPLETED" && "+"}
                      {formatRupiah(order.total_price)}
                    </div>
                    <Badge className="w-fit text-[10px] h-5 py-0">
                      {orderStatusMapping[
                        order.status as keyof typeof orderStatusMapping
                      ] || order.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {orders.length === 0 && (
            <p className="text-muted-foreground text-center py-4">
              Belum ada pesanan terbaru.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
