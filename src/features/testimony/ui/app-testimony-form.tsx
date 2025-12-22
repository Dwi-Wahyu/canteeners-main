"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTransition, useState } from "react";
import { toast } from "sonner";
import { createAppTestimony } from "../lib/testimony-actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star } from "lucide-react";

export const TESTIMONY_ROLES: Record<string, string> = {
  SHOP_OWNER: "Pemilik Kedai",
  CUSTOMER: "Pelanggan",
  STUDENT: "Mahasiswa",
  LECTURER: "Dosen",
  PUBLIC: "Umum",
};

export default function AppTestimonyForm({
  defaultName,
  defaultRole,
}: {
  defaultName?: string;
  defaultRole?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [selectedRole, setSelectedRole] = useState(defaultRole || "");
  const [rating, setRating] = useState(5);

  async function onSubmit(formData: FormData) {
    startTransition(async () => {
      const message = formData.get("message") as string;
      const from = formData.get("from") as string;
      const role = formData.get("role") as string;

      if (!message || !from) {
        toast.error("Nama dan pesan harus diisi");
        return;
      }

      const res = await createAppTestimony({ message, from, role, rating });

      if (res.success) {
        toast.success(res.message);
        const form = document.getElementById(
          "testimony-form"
        ) as HTMLFormElement;
        form?.reset();
        setSelectedRole("");
        setRating(5);
      } else {
        toast.error(res.error.message);
      }
    });
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Berikan Ulasan Aplikasi</CardTitle>
        <CardDescription>
          Pendapat Anda membantu kami berkembang.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={onSubmit} id="testimony-form" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="from">Nama Anda</Label>
            <Input
              id="from"
              name="from"
              defaultValue={defaultName}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Peran</Label>
            <Select
              name="role"
              value={selectedRole}
              onValueChange={setSelectedRole}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih Peran Anda" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TESTIMONY_ROLES).map(([key, label]) => (
                  <SelectItem key={key} value={label}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="role" value={selectedRole} />
          </div>

          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className="focus:outline-hidden"
                >
                  <Star
                    className={`w-8 h-8 ${
                      value <= rating
                        ? "text-orange-400 fill-orange-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
            <input type="hidden" name="rating" value={rating} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Pesan / Ulasan</Label>
            <Textarea
              id="message"
              name="message"
              placeholder="Ceritakan pengalaman Anda menggunakan Canteeners..."
              className="min-h-40"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Mengirim..." : "Kirim Ulasan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
