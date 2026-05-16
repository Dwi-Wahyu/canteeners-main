"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import { ReactNode } from "react";

export default function HistoryBackButton({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  const router = useRouter();

  return (
    <button
      onClick={router.back}
      className={`${cn(className)} text-muted-foreground cursor-pointer`}
    >
      {children ? children : <ChevronLeft className="w-4 h-4" />}
    </button>
  );
}
