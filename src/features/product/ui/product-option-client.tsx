import { ProductOption, ProductOptionValue } from "@/generated/prisma/client";

import CreateProductOptionValueDialog from "./create-product-option-value-dialog";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import DeleteProductOptionDialog from "./delete-product-option-dialog";
import EditProductOptionDialog from "./edit-product-option-dialog";
import { productOptionTypeMapping } from "@/constant/product-mapping";
import {
  Asterisk,
  CircleQuestionMark,
  CopyCheck,
  SquareCheck,
} from "lucide-react";
import ProductOptionValueClient from "./product-option-value-client";

type ProductOptionWithValue = ProductOption & { values: ProductOptionValue[] };

export default function ProductOptionClient({
  product_id,

  options,
}: {
  product_id: string;

  options: ProductOptionWithValue[];
}) {
  return (
    <div className="flex flex-col gap-4 mb-2">
      {options.map((option) => (
        <Card key={option.id}>
          <CardContent className="flex flex-col gap-2">
            <CardTitle className="text-lg">{option.option}</CardTitle>

            <div>
              <div className="flex gap-1.5 mb-1 items-center">
                {option.type === "MULTIPLE" ? (
                  <CopyCheck className="w-4 h-4" />
                ) : (
                  <SquareCheck className="w-4 h-4" />
                )}
                <h1 className=" text-sm">
                  {productOptionTypeMapping[option.type]}
                </h1>
              </div>

              {option.is_required ? (
                <div className="flex gap-1 items-center">
                  <Asterisk className="w-4 h-4" />
                  <h1 className=" text-sm">Wajib pilih opsi</h1>
                </div>
              ) : (
                <div className="flex gap-1.5 items-center">
                  <CircleQuestionMark className="w-4 h-4" />
                  <h1 className=" text-sm">Opsional</h1>
                </div>
              )}
            </div>

            <div>
              <h1 className="font-medium">Opsi Varian</h1>

              {option.values.length === 0 && (
                <CardDescription className="mt-1">
                  Belum ada opsi silakan klik "Tambah Opsi"
                </CardDescription>
              )}

              {option.values.length !== 0 && (
                <div className="flex flex-col gap-2">
                  {option.values.map((value, idx) => (
                    <ProductOptionValueClient
                      key={idx}
                      value={value}
                      product_id={product_id}
                    />
                  ))}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex gap-2 items-center border-t">
            <CreateProductOptionValueDialog
              option_id={option.id}
              product_id={option.product_id}
              option={option.option}
            />
            <EditProductOptionDialog option={option} />
            <DeleteProductOptionDialog option_id={option.id} />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
