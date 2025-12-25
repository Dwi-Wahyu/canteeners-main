"use client";

import { ChevronLeft, EllipsisVertical, Trash, Trash2 } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getImageUrl } from "@/helper/get-image-url";
import { ParticipantInfo } from "../types";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Timestamp } from "firebase/firestore";
import { usePathname } from "next/navigation";
import { ReportUserDialog } from "./report-user-dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteChatDialog } from "./delete-chat-dialog";

export default function ChatTopbar({
  opponent,
  lastSeenAt,
  opponentId,
  chatId,
}: {
  opponent: ParticipantInfo;
  lastSeenAt: Timestamp;
  opponentId?: string;
  chatId?: string;
}) {
  const pathname = usePathname();

  return (
    <div className="p-4 fixed justify-between top-0 left-0 w-full flex items-center border-b bg-white shadow-sm z-10">
      <div className="flex items-center gap-4">
        <Link
          className="text-muted-foreground"
          href={
            pathname.includes("/dashboard-kedai/")
              ? "/dashboard-kedai/chat"
              : "/chat"
          }
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

      <DropdownMenu>
        <DropdownMenuTrigger>
          <EllipsisVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="mr-3 mt-2">
          {opponentId && (
            <DropdownMenuItem asChild>
              <ReportUserDialog reportedUserId={opponentId} />
            </DropdownMenuItem>
          )}

          {chatId && (
            <DropdownMenuItem asChild>
              <DeleteChatDialog chatId={chatId} />
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
