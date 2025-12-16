"use client";

import { getUserShortDetail } from "@/features/user/lib/user-queries";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getImageUrl } from "@/helper/get-image-url";

export default function ChatTopbar({
  isOwner,
  avatar,
  name,
}: {
  isOwner: boolean;
  name: string;
  avatar: string;
}) {
  return (
    <div className="p-4 absolute top-0 left-0 w-full flex items-center gap-1 border-b bg-white shadow-sm z-10">
      <Link
        className="text-muted-foreground"
        href={isOwner ? "/dashboard-kedai/chat" : "/chat"}
      >
        <ChevronLeft className="w-5 h-5" />
      </Link>

      <div className="flex gap-2 items-center">
        <Avatar>
          <AvatarImage src={getImageUrl(avatar)} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>

        <h1 className="font-semibold text-lg">{name}</h1>
      </div>
    </div>
  );
}
