import TopbarWithBackButton from "@/components/layouts/topbar-with-backbutton";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, ThumbsUp } from "lucide-react";

export default function LoadingUlasanPelanggan() {
  return (
    <div>
      <TopbarWithBackButton title="Ulasan Pelanggan" />

      <div className="mb-4 grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="flex flex-col items-center gap-1">
            <h1 className="font-semibold text-lg">Rating Toko</h1>
            <div className="flex gap-1 items-center">
              <Star className="w-5 h-5" />
              <h1 className="font-semibold text-lg">{0} </h1>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center gap-1">
            <h1 className="font-semibold text-lg">Jumlah Ulasan</h1>
            <div className="flex gap-1 items-center">
              <ThumbsUp className="w-5 h-5" />
              <h1 className="font-semibold text-lg">{0} </h1>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid mt-4 grid-cols-1 gap-4 md:grid-cols-3">
        <Skeleton className="w-full h-52" />
        <Skeleton className="w-full h-52" />
        <Skeleton className="w-full h-52" />
      </div>
    </div>
  );
}
