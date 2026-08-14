"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, HandPlatter, MapPin, QrCode } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import CustomerPositionBreadcrumb from "./customer-position-breadcrumb";
import NavButton from "@/components/nav-button";
import { GetCustomerProfileType } from "@/features/user/types/user-queries-types";
import RunIcon from "@/components/icons/run-icon";
import { PostOrderType } from "@prisma/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PostOrderTypeTab({
  postOrderType,
  setPostOrderType,
  customerProfile,
  canteen_name,
  selectTablePageUrl,
}: {
  postOrderType: PostOrderType;
  setPostOrderType: (type: PostOrderType) => void;
  customerProfile: GetCustomerProfileType;
  canteen_name: string;
  selectTablePageUrl: string;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h1 className="font-semibold">Pilih Jenis Order</h1>
      </div>

      <Tabs
        defaultValue={postOrderType}
        value={postOrderType}
        onValueChange={(value) => setPostOrderType(value as PostOrderType)}
      >
        <TabsList>
          <TabsTrigger value="DELIVERY_TO_TABLE">
            <HandPlatter />
            Makan Di Meja
          </TabsTrigger>
          <TabsTrigger value="TAKEAWAY">
            <RunIcon />
            Take Away
          </TabsTrigger>
        </TabsList>

        <TabsContent value="DELIVERY_TO_TABLE">
          <Card>
            <CardContent>
              {customerProfile.floor && customerProfile.table_number ? (
                <div className="flex flex-col w-full items-center gap-4">
                  <CustomerPositionBreadcrumb
                    canteen_name={canteen_name}
                    floor={customerProfile.floor}
                    table_number={customerProfile.table_number}
                  />
                  <NavButton href={selectTablePageUrl} size="lg">
                    Pilih Ulang
                  </NavButton>
                </div>
              ) : (
                /* === CTA Banner: Belum pilih meja === */
                <div className="rounded-xl border-2 border-dashed border-amber-400 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-600 p-4 flex flex-col items-center gap-3 text-center">
                  {/* Ikon peringatan */}
                  <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                  </div>

                  {/* Teks */}
                  <div>
                    <p className="font-semibold text-sm text-amber-800 dark:text-amber-300">
                      Kamu belum memilih meja!
                    </p>
                    <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-0.5">
                      Pilih meja agar pesanan bisa diantarkan ke tempatmu
                    </p>
                  </div>

                  {/* Tombol utama */}
                  <Button
                    asChild
                    size="sm"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white border-0 font-semibold"
                  >
                    <Link href={selectTablePageUrl}>
                      <MapPin className="w-4 h-4" />
                      Pilih Meja Sekarang
                    </Link>
                  </Button>

                  {/* Atau scan QR */}
                  <div className="flex items-center gap-1.5 text-xs text-amber-700/70 dark:text-amber-400/70">
                    <QrCode className="w-3 h-3" />
                    <span>atau scan QR Code di meja kamu</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="TAKEAWAY">
          <Card>
            <CardContent>
              <h1 className="font-semibold mb-2">Ambil pesanan di kedai</h1>
              <h1 className="text-sm text-muted-foreground">
                Opsi jika kedai sedang sibuk dan tidak sempat mengantarkan
                pesanan
              </h1>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
