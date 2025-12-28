"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { getImageUrl } from "@/helper/get-image-url";
import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function CanteenFocusList({ data }: { data: any[] }) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  useEffect(() => {
    // Inisialisasi Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Jika elemen berada di area fokus (tengah layar)
          if (entry.isIntersecting) {
            const id = Number(entry.target.getAttribute("data-id"));
            setActiveId(id);
          }
        });
      },
      {
        // rootMargin dengan nilai negatif di atas/bawah agar deteksi fokus di tengah
        rootMargin: "-20% 0px -20% 0px",
        threshold: 0.6, // Minimal 60% elemen terlihat baru dianggap fokus
      }
    );

    // Mendaftarkan setiap elemen ke observer
    itemRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [data]);

  return (
    <div className="space-y-12 py-4">
      {data.map((item) => (
        <div
          key={item.id}
          data-id={item.id}
          ref={(el) => {
            if (el) itemRefs.current.set(item.id, el);
            else itemRefs.current.delete(item.id);
          }}
          className={cn(
            "transition-all duration-500 ease-in-out transform",
            activeId === item.id
              ? "opacity-100 scale-100"
              : "opacity-40 scale-95 grayscale-50"
          )}
        >
          <Card
            className={cn(
              "overflow-hidden border-2 transition-colors shadow-lg",
              activeId === item.id ? "border-primary/50" : "border-transparent"
            )}
          >
            <div className="relative h-56 w-full">
              <Image
                src={getImageUrl(item.image_url)} //
                alt={item.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <h4 className="text-2xl font-bold">{item.name}</h4>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">
                    ± {item.estimated_visitors} Pengunjung / Hari
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
}
