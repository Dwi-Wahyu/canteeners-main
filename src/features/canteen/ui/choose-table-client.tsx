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
import { useSearchParams } from "next/navigation";
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
  const params = useSearchParams();
  const floorSearchParams = params.get("floor");
  const tableNumberSearchParams = params.get("table_number");

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
          title: "Berhasil pilih meja",
          message: "Silakan belanja sepuasmu",
          actionButtons: (
            <div className="grid grid-cols-2 gap-3">
              <Button size="lg" asChild variant={"outline"}>
                <Link onClick={notificationDialog.hide} href={"/keranjang"}>
                  <ShoppingCart />
                  Lihat Keranjang
                </Link>
              </Button>

              <Button size="lg" asChild>
                <Link
                  onClick={notificationDialog.hide}
                  href={"/kantin/" + canteen.slug}
                >
                  <UtensilsCrossed />
                  Mulai Belanja
                </Link>
              </Button>
            </div>
          ),
        });
      } else {
        notificationDialog.error({
          title: "Gagal Pilih Meja",
          message: "Terjadi kesalahan tidak terduga",
          actionButtons: (
            <div>
              <NavButton href={"/customer-service"}>Hubungi CS</NavButton>
              <Button variant={"default"}>Pilih Ulang</Button>
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
                  src={getImageUrl(map.image_url)}
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
