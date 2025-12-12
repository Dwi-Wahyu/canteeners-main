import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CircleAlert, CreditCard, DollarSign, QrCode } from "lucide-react";


export default async function PaymentMethodExplanationDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <CircleAlert className="text-muted-foreground w-5 h-5 cursor-pointer hover:text-primary transition-colors" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Panduan Pengaturan Metode Pembayaran Kedai</DialogTitle>
          <DialogDescription>
            Pahami aturan dan informasi yang diperlukan untuk mengaktifkan
            setiap metode pembayaran di kedai Anda.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[70vh]">
          <div className="space-y-4 pt-2">
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-md">
              <h4 className="font-semibold text-sm text-yellow-700 flex items-center mb-1">
                <CircleAlert className="w-5 h-5 mr-2" />
                Aturan Wajib Aktivasi
              </h4>
              <p className="text-sm text-yellow-600">
                Anda harus mengaktifkan minimal satu metode pembayaran dari opsi
                berikut: Tunai, QRIS, atau Transfer Bank. Kedai tidak dapat
                beroperasi tanpa adanya metode pembayaran yang aktif.
              </p>
            </div>

            <h5 className="font-bold text-md mt-4">
              Detail Kustomisasi Metode Pembayaran
            </h5>

            <div className="border p-3 rounded-md">
              <h6 className="font-semibold flex items-center">
                <DollarSign className="w-4 h-4 mr-1" />
                Tunai (Cash on Delivery/COD)
              </h6>
              <p className="text-sm mt-1 text-muted-foreground">
                Pembayaran dilakukan secara langsung saat pesanan diterima.
              </p>
            </div>

            <div className="border p-3 rounded-md">
              <h6 className="font-semibold flex items-center">
                <QrCode className="w-4 h-4 mr-1" />
                QRIS
              </h6>
              <p className="text-sm mt-1 text-muted-foreground">
                Pembayaran menggunakan kode QR. Pastikan Anda telah mengunggah
                kode QRIS yang valid.
              </p>
              <div className="mt-2">
                <p className="text-xs italic text-muted-foreground mt-1">
                  Gunakan catatan untuk menginformasikan pelanggan tentang biaya
                  tambahan layanan (misalnya, "Biaya admin Rp 1000 ditanggung
                  pembeli").
                </p>
              </div>
            </div>

            <div className="border p-3 rounded-md">
              <h6 className="font-semibold flex items-center">
                <CreditCard className="w-4 h-4 mr-1" />
                Transfer Bank
              </h6>
              <p className="text-sm mt-1 text-muted-foreground">
                Pembayaran melalui transfer ke rekening bank Anda.
              </p>
              <div className="mt-2">
                <p className="text-xs italic text-muted-foreground mt-1">
                  Gunakan catatan untuk mencantumkan nama bank dan nama pemilik
                  rekening (misalnya, "BCA a.n. Toko Enak Selalu" atau "Mandiri:
                  12345678 a.n. Joni").
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
