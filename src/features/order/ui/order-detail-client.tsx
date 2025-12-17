export async function OrderDetailClient({ order_id }: { order_id: string }) {
  return (
    <div>
      <h1>{order_id}</h1>
    </div>
  );
}
