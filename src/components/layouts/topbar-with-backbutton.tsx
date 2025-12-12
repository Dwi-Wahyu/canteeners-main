import React from "react";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function TopbarWithBackButton({
  title,
  backUrl,
  actionButton,
}: {
  title: string;
  backUrl?: string;
  actionButton?: React.ReactNode;
}) {
  return (
    <div className="px-5 py-4 bg-background z-20 fixed top-0 left-0 shadow w-full justify-between flex items-center">
      <div className="flex items-center">
        <Link className="w-5 h-5 mb-0.5" href={backUrl ?? "/"}>
          <ChevronLeft />
        </Link>

        <h1 className="font-semibold text-lg">{title}</h1>
      </div>

      {actionButton}
    </div>
  );
}
