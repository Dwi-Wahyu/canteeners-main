"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getImageUrl } from "@/helper/get-image-url";
import { ParticipantInfo } from "../types";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Timestamp } from "firebase/firestore";

export default function ChatTopbar({
  opponent,
  lastSeenAt,
}: {
  opponent: ParticipantInfo;
  lastSeenAt: Timestamp;
}) {
  return (
    <div className="p-4 fixed top-0 left-0 w-full flex items-center gap-4 border-b bg-white shadow-sm z-10">
      <Link
        className="text-muted-foreground"
        href={opponent.role === "CUSTOMER" ? "/dashboard-kedai/chat" : "/chat"}
      >
        <ChevronLeft className="w-6 h-6" />
      </Link>

      <div className="flex gap-4 items-center">
        <Avatar className="size-11">
          <AvatarImage src={getImageUrl(opponent.avatar)} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>

        <div>
          <h1 className="font-semibold text-lg">{opponent.name}</h1>

          {lastSeenAt && (
            <h1 className="text-primary">
              {formatDistanceToNow(lastSeenAt.toDate(), {
                locale: localeId,
              })}
            </h1>
          )}
        </div>
      </div>
    </div>
  );
}
