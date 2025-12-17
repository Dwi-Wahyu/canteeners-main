"use client";

import { formatRupiah } from "@/helper/format-rupiah";
import { useWatchOrderUpdate } from "@/hooks/use-watch-order-update";

export function OrderDetailClient({ order_id }: { order_id: string }) {
  const { orderData, loading } = useWatchOrderUpdate(order_id);

  if (loading) {
    return <div className="p-4 text-center">Memuat detail order...</div>;
  }

  if (!orderData) {
    return <div className="p-4 text-center">Order tidak ditemukan</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Order #{order_id}</h1>

      <div>
        <p className="text-sm text-gray-600">
          Meja: {orderData.customer.table_number} | Lantai:{" "}
          {orderData.customer.floor}
        </p>
        <p className="text-sm text-gray-600">
          Pelanggan: {orderData.customer.user.name}
        </p>
      </div>

      <div>
        <h2 className="font-semibold">Dari: {orderData.shop.name}</h2>
        {orderData.shop.canteen && <p>{orderData.shop.canteen.name}</p>}
      </div>

      <div>
        <h2 className="font-semibold mb-2">Item Pesanan:</h2>
        {orderData.order_items.map((item) => (
          <div key={item.id} className="flex gap-4 py-2">
            <img
              src={item.product.image_url || "/placeholder.jpg"}
              alt={item.product.name}
              className="w-16 h-16 object-cover rounded"
            />
            <div className="flex-1">
              <p className="font-medium">{item.product.name}</p>
              <p className="text-sm text-gray-600">
                {item.quantity} x Rp {item.price_at_add.toLocaleString("id-ID")}
              </p>
              {item.note && (
                <p className="text-xs text-gray-500">Catatan: {item.note}</p>
              )}
            </div>
            <p className="font-medium">{formatRupiah(item.subtotal)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
