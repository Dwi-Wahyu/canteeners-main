import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { getImageUrl } from "@/helper/get-image-url";
import NavButton from "@/components/nav-button";

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
        <div className="space-y-8">
          {orders.map((order) => (
            <div key={order.id} className="w-full border rounded-lg px-4 py-3">
              <Badge className="mb-4">
                {orderStatusMapping[
                  order.status as keyof typeof orderStatusMapping
                ] || order.status}
              </Badge>
              <div className="flex items-center w-full justify-between">
                <div className="flex items-center">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={getImageUrl(order.customer.user.avatar)}
                      alt="Avatar"
                    />
                    <AvatarFallback>
                      {order.customer.user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-2">
                    <p className="font-medium leading-none">
                      {order.customer.user.name}
                    </p>
                    {formatRupiah(order.total_price)}
                  </div>
                </div>

                <NavButton
                  size="sm"
                  href={`/dashboard-kedai/order/${order.id}`}
                >
                  Lihat
                </NavButton>
              </div>
            </div>
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
