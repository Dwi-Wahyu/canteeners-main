import TopbarWithBackButton from "@/components/layouts/topbar-with-backbutton";
import Client from "./client";
import { getProductById } from "@/features/product/lib/product-queries";
import { notFound } from "next/navigation";
import NavButton from "@/components/nav-button";
import { Edit } from "lucide-react";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ product_id: string }>;
}) {
  const { product_id } = await params;

  const data = await getProductById(product_id);

  if (!data) {
    return notFound();
  }

  return (
    <div>
      <TopbarWithBackButton
        title="Detail Produk"
        backUrl="/dashboard-kedai/produk"
        actionButton={
          <div>
            <NavButton
              variant="ghost"
              size="icon"
              href={`/dashboard-kedai/produk/${data.id}/edit`}
            >
              <Edit />
            </NavButton>
          </div>
        }
      />

      <div className="p-5 pt-24">
        <Client data={data} />
      </div>
    </div>
  );
}
