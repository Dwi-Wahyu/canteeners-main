"use client";

import { Button } from "@/components/ui/button";
import { Loader, Send } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { notificationDialog } from "@/hooks/use-notification-dialog";

export default function SendPaymentProofForm({
  order_id,
  conversation_id,
  customer_id,
}: {
  order_id: string;
  conversation_id: string;
  customer_id: string;
}) {
  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (proof_url: string) => {
      return await sendPaymentProof({
        order_id,
        proof_url,
        conversation_id,
        customer_id,
      });
    },
  });

  const [files, setFiles] = useState<File[]>([]);

  async function handleSend() {
    if (files.length === 0) {
      return;
    }

    const proofUrl = await uploadPaymentProofImage(files[0]);

    // todo: cek nanti kalo nda berhasil simpan gambar bukti
    const result = await mutateAsync(proofUrl);

    if (result.success) {
      notificationDialog.success({
        title: "Berhasil mengirim bukti pembayaran",
        message: "Silahkan tunggu konfirmasi dari kedai",
        actionButtons: <Button onClick={notificationDialog.hide}>Tutup</Button>,
      });
    } else {
      notificationDialog.error({
        title: "Gagal mengirim bukti pembayaran",
        message: result.error.message,
        actionButtons: <Button onClick={notificationDialog.hide}>Tutup</Button>,
      });
    }
  }

  return (
    <div>
      <FileUploadImage
        multiple={false}
        onFilesChange={(newFiles) => {
          setFiles(newFiles);
        }}
      />

      <Button
        disabled={files.length === 0 || isPending}
        onClick={handleSend}
        size={"lg"}
        className="w-full mt-4"
      >
        {isPending ? (
          <>
            <Loader className="animate-spin" /> Mengirim . . .
          </>
        ) : (
          <>
            <Send />
            Kirim
          </>
        )}
      </Button>
    </div>
  );
}
