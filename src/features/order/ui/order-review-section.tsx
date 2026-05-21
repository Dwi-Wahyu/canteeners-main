"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ShopTestimony } from "@/generated/prisma";
import StarIcon from "@/components/icons/star-icon";
import StarFilledIcon from "@/components/icons/star-filled-icon";
import { createShopTestimony } from "@/features/testimony/lib/testimony-actions";
import { containsBadWords } from "@/lib/moderation/contains-bad-words";

export default function OrderReviewSection({
  order_id,
  prevTestimony,
  isUserCustomer,
}: {
  order_id: string;
  prevTestimony: ShopTestimony | null;
  isUserCustomer: boolean;
}) {
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");

  const [testimony, setTestimony] = useState<ShopTestimony | null>(
    prevTestimony,
  );

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async () => {
      return await createShopTestimony({ message, rating, order_id });
    },
  });

  async function handleSend() {
    if (!message.trim()) {
      toast.info("Berikan ulasan sebelum mengirim");
      return;
    }

    if (containsBadWords(message)) {
      toast.info("Ulasan mengandung ujaran kebencian");
      return;
    }

    const result = await mutateAsync();

    if (result.success) {
      toast.success(result.message);

      if (result.data) {
        setTestimony(result.data);
      }
    } else {
      toast.error(result.error.message);
    }
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="flex flex-col">
        {testimony && (
          <div className="space-y-4">
            <div className="space-y-1">
              <Label className="mb-4">Ulasan Pelanggan</Label>
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((rate) => (
                    <button key={rate} className="">
                      {testimony.rating >= rate ? (
                        <StarFilledIcon className="w-5 h-5 text-orange-400" />
                      ) : (
                        <StarIcon className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>
                  ))}
                </div>
                <span className="ml-2 text-sm font-semibold text-gray-700">
                  {testimony.rating}/5
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed">
              {testimony.message}
            </p>
          </div>
        )}

        {!testimony && !isUserCustomer && (
          <div className="space-y-1">
            <Label>Ulasan & Rating</Label>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Customer belum menambahkan ulasan atau rating
            </p>
          </div>
        )}

        {!testimony && isUserCustomer && (
          <>
            <div className="space-y-1 mb-4">
              <Label>Ulasan & Rating</Label>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Bagikan pengalaman Anda memesan di kedai ini.
              </p>
            </div>

            <div className="flex mb-4 gap-2 items-center">
              <div className="flex gap-2 items-center">
                {[1, 2, 3, 4, 5].map((rate) => (
                  <button
                    key={rate}
                    className="cursor-pointer block "
                    onClick={() => setRating(rate)}
                  >
                    {rating >= rate ? (
                      <StarFilledIcon className="w-5 h-5 text-orange-400" />
                    ) : (
                      <StarIcon className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <span className="ml-2 text-sm font-semibold text-gray-700">
                  {rating}/5
                </span>
              )}
            </div>

            <div className="mb-4">
              <Textarea
                id="ulasan"
                placeholder="Tulis ulasan Anda di sini..."
                className="mt-1.5 min-h-25 rounded-xl border-gray-200"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <Button
              className="w-full"
              disabled={isPending}
              onClick={handleSend}
            >
              Kirim Ulasan
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
