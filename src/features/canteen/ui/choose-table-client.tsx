"use client";

import { Save, ShoppingCart, UtensilsCrossed, Loader2 } from "lucide-react";
import { useState } from "react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemTitle,
} from "@/components/ui/item";
import { Button } from "@/components/ui/button";
import { notificationDialog } from "@/hooks/use-notification-dialog";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { chooseCustomerTable } from "@/features/user/lib/user-actions";
import NavButton from "@/components/nav-button";
import { GetCanteenIncludeMaps } from "../types/canteen-queries-types";
import { getImageUrl } from "@/helper/get-image-url";

interface SelectedTable {
  floor: number;
  table_number: number;
}

export default function ChooseTableClient({
  canteen,
  customer_id,
  defaultSelectedTable,
}: {
  canteen: GetCanteenIncludeMaps;
  customer_id: string;
  defaultSelectedTable: SelectedTable | null;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const floorSearchParams = params.get("floor");
  const tableNumberSearchParams = params.get("table_number");
  const callbackUrl = params.get("callbackUrl") || "/kantin/" + canteen.slug;

  const canteen_id = canteen.id;

  const [selectedTable, setSelectedTable] = useState<SelectedTable | null>(
    floorSearchParams &&
      tableNumberSearchParams &&
      !isNaN(parseInt(floorSearchParams)) &&
      !isNaN(parseInt(tableNumberSearchParams))
      ? {
          floor: parseInt(floorSearchParams),
          table_number: parseInt(tableNumberSearchParams),
        }
      : defaultSelectedTable
  );

  const defaultTab = canteen.maps[0]?.floor.toString() || "1";

  const [isLoading, setIsLoading] = useState(false);

  const handleTableChange = (floor: number, table_number: number) => {
    setSelectedTable({ floor, table_number });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (selectedTable) {
      const { floor, table_number } = selectedTable;

      const result = await chooseCustomerTable({
        canteen_id,
        floor,
        table_number,
        customer_id,
      });

      if (result.success) {
        notificationDialog.success({
          title: "Meja Berhasil Dipilih",
          message: `Kamu telah memilih Meja ${table_number} di Lantai ${floor}.`,
          showLoadingBar: true,
          actionButtons: (
            <div className="flex justify-center w-full">
              <Button size="lg" className="w-full max-w-[200px]" asChild>
                <Link
                  onClick={notificationDialog.hide}
                  href={callbackUrl}
                >
                  Mulai Belanja
                </Link>
              </Button>
            </div>
          ),
        });

        // Redirect otomatis setelah 2 detik
        setTimeout(() => {
          notificationDialog.hide();
          router.push(callbackUrl);
        }, 2000);
      } else {
        notificationDialog.error({
          title: "Gagal Pilih Meja",
          message: "Terjadi kesalahan tidak terduga, silakan coba lagi.",
          actionButtons: (
            <div className="flex flex-col sm:flex-row justify-center gap-3 w-full">
              <NavButton href={"/customer-service"} variant="outline">
                Hubungi CS
              </NavButton>
              <Button
                variant={"default"}
                onClick={() => notificationDialog.hide()}
              >
                Pilih Ulang
              </Button>
            </div>
          ),
        });
      }
    } else {
      console.log("Belum ada meja yang dipilih.");
    }

    setIsLoading(false);
  };

  const isSaveDisabled = selectedTable === null;

  return (
    <form onSubmit={handleSave} className="mt-4 max-w-lg mx-auto">
      <div className="flex flex-col">
        <Tabs defaultValue={defaultTab}>
          <TabsList className="w-full py-6">
            {canteen.maps.map((map, i) => (
              <TabsTrigger
                key={i}
                className="py-5"
                value={map.floor.toString()}
              >
                Lantai {map.floor.toString()}
              </TabsTrigger>
            ))}
          </TabsList>

          {canteen.maps.map((map, i) => {
            const floorKey = map.floor.toString();
            return (
              <TabsContent key={i} value={floorKey} className="mt-2">
                <img
                  src={getImageUrl("/canteen-map/" + map.image_url)}
                  className="mb-4 shadow rounded-lg"
                />
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: map.table_count }, (_, i) => i + 1).map(
                    (table_number) => {
                      const tableId = `radio-table-${map.floor}-${table_number}`;

                      const isChecked =
                        selectedTable?.floor === map.floor &&
                        selectedTable?.table_number === table_number;

                      return (
                        <Item
                          key={tableId}
                          variant={"outline"}
                          onClick={() => {
                            handleTableChange(map.floor, table_number);
                          }}
                          className={`${
                            isChecked
                              ? "bg-primary cursor-pointer text-primary-foreground"
                              : "cursor-pointer"
                          }`}
                        >
                          <ItemContent>
                            <ItemTitle>
                              <label
                                htmlFor={tableId}
                                className={`cursor-pointer`}
                              >
                                Meja {table_number}
                              </label>
                            </ItemTitle>
                          </ItemContent>
                          <ItemActions>
                            <input
                              type="radio"
                              id={tableId}
                              name="selected_table"
                              value={`${map.floor}-${table_number}`}
                              checked={isChecked}
                              onChange={() =>
                                handleTableChange(map.floor, table_number)
                              }
                              hidden
                              onClick={(e) => e.stopPropagation()}
                            />
                          </ItemActions>
                        </Item>
                      );
                    }
                  )}
                </div>

                {map.table_count === 0 && (
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia>
                        <UtensilsCrossed size={60} className="text-gray-400" />
                      </EmptyMedia>
                      <EmptyTitle>Meja Belum Ditambahkan</EmptyTitle>
                      <EmptyDescription>
                        Sabar yaa, kami masih bikin qrcodenya
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                )}
              </TabsContent>
            );
          })}
        </Tabs>

        <Button
          type="submit"
          className="w-full mt-4"
          disabled={isSaveDisabled || isLoading}
          size={"lg"}
        >
          {isLoading ? <Loader2 className="animate-spin" /> : <Save />}
          Simpan Pilihan Meja
        </Button>
      </div>
    </form>
  );
}
