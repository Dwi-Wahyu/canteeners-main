import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { AppTestimony } from "@/generated/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAppTestimonies } from "../lib/testimony-queries";

export default async function AppTestimonyList() {
  const testimonies = await getAppTestimonies(4);

  return (
    <div className="w-full px-5 bg-accent/20 py-20 flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-4xl mb-2">Apa Kata Mereka?</h1>
        <h1 className="text-muted-foreground text-lg">
          Pengalaman pengguna Canteeners.
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto w-full">
        {testimonies.map((testimony, idx) => (
          <Card key={idx}>
            <CardContent className="flex flex-col gap-5 pt-6">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= (testimony.rating || 5)
                        ? "text-orange-400 fill-orange-400"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>

              <h1 className="italic text-lg">"{testimony.message}"</h1>

              <div className="flex gap-3 items-center">
                <Avatar className="size-10">
                  <AvatarImage
                    src={`https://api.dicebear.com/9.x/initials/svg?seed=${testimony.from}`}
                    alt={testimony.from}
                  />
                  <AvatarFallback className="text-xs">
                    {testimony.from.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h1 className="font-medium text-sm">{testimony.from}</h1>
                  <h1 className="text-muted-foreground text-sm">
                    {testimony.role || "Pengguna"}
                  </h1>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {testimonies.length === 0 && (
        <p className="text-center text-muted-foreground">Belum ada ulasan.</p>
      )}
    </div>
  );
}
