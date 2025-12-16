"use client";

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
    <div className="p-4 absolute top-0 left-0 w-full flex items-center gap-4 border-b bg-white shadow-sm z-10">
      <Link
        className="text-muted-foreground"
        href={isOwner ? "/dashboard-kedai/chat" : "/chat"}
      >
        <ChevronLeft className="w-6 h-6" />
      </Link>

      <div className="flex gap-4 items-center">
        <Avatar className="size-11">
          <AvatarImage src={getImageUrl(avatar)} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>

        <div>
          <h1 className="font-semibold text-lg">{name}</h1>

          <div className="flex items-center gap-1">
            <div className="bg-primary w-3 h-3 mb-0.5 rounded-full"></div>
            <h1 className="text-primary">Online</h1>
          </div>
        </div>
      </div>
    </div>
  );
}
