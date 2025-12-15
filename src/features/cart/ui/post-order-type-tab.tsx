"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, HandPlatter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import CustomerPositionBreadcrumb from "./customer-position-breadcrumb";
import NavButton from "@/components/nav-button";
// import { GetCustomerProfileType } from "@/features/user/types/user-queries-types";
import RunIcon from "@/components/icons/run-icon";
import { PostOrderType } from "@/generated/prisma";

export default function PostOrderTypeTab({
  postOrderType,
  setPostOrderType,
  // customerProfile,
  canteen_name,
  selectTablePageUrl,
}: {
  postOrderType: PostOrderType;
  setPostOrderType: (type: PostOrderType) => void;
  // customerProfile: GetCustomerProfileType;
  canteen_name: string;
  selectTablePageUrl: string;
}) {
  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="font-semibold mb-2">Pilih Jenis Order</h1>

        <AlertCircle className="w-4 h-4 text-muted-foreground" />
      </div>

      <Tabs
        defaultValue={postOrderType}
        value={postOrderType}
        onValueChange={(value) => setPostOrderType(value as PostOrderType)}
        className=""
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
              {/* {customerProfile.floor && customerProfile.table_number ? (
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
                <>
                  <h1 className="font-semibold mb-2">
                    Pesanan diantarkan ke meja kamu
                  </h1>
                  <h1 className="text-sm text-muted-foreground">
                    Belum memilih nomor meja, scan QR Code di meja anda atau{" "}
                    <Link
                      href={selectTablePageUrl}
                      className="underline text-blue-600"
                    >
                      Klik disini untuk pilih meja
                    </Link>
                  </h1>
                </>
              )} */}

              <>
                <h1 className="font-semibold mb-2">
                  Pesanan diantarkan ke meja kamu
                </h1>
                <h1 className="text-sm text-muted-foreground">
                  Belum memilih nomor meja, scan QR Code di meja anda atau{" "}
                  <Link
                    href={selectTablePageUrl}
                    className="underline text-blue-600"
                  >
                    Klik disini untuk pilih meja
                  </Link>
                </h1>
              </>
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
