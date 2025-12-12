"use client";

import { ProductOptionValue } from "@/app/generated/prisma";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import EditProductOptionValueDialog from "./edit-product-option-value-dialog";
import DeleteOptionValueDialog from "./delete-option-value-dialog";

export default function ProductOptionValueClient({
  product_id,

  value,
}: {
  product_id: string;

  value: ProductOptionValue;
}) {
  return (
    <div className="flex justify-between items-center border rounded px-4 py-2 mt-1 shadow">
      <div>
        <h1 className="text-sm">{value.value}</h1>
        {value.additional_price && (
          <h1 className="text-sm leading-tight text-muted-foreground">
            + Rp{value.additional_price}
          </h1>
        )}
      </div>

      <div className="flex items-center">
        <EditProductOptionValueDialog value={value} product_id={product_id} />
        <DeleteOptionValueDialog value_id={value.id} />
      </div>
    </div>
  );
}
