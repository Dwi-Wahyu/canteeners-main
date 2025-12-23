import { prisma } from "@/lib/prisma";
import { auth } from "@/config/auth";
import { redirect } from "next/navigation";

import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import TopbarWithBackButton from "@/components/layouts/topbar-with-backbutton";
import { MessageCircle } from "lucide-react";
import { QuickChatItem } from "@/features/chat/ui/quick-chat-item";
import QuickChatForm from "@/features/chat/ui/quick-chat-form";
import { getUserQuickChats } from "@/features/chat/lib/chat-queries";

export default async function QuickChatPage() {
  const session = await auth();

  if (!session) {
    redirect("/login-kedai");
  }

  const quickChats = await getUserQuickChats(session.user.id);

  return (
    <div className="p-5 pt-20">
      <TopbarWithBackButton
        title="Pesan Singkat"
        backUrl="/dashboard-kedai/pengaturan"
        actionButton={<QuickChatForm user_id={session.user.id} />}
      />

      {quickChats.length === 0 && (
        <Empty className="border mt-2">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MessageCircle />
            </EmptyMedia>
            <EmptyTitle>Belum ada pesan singkat</EmptyTitle>
          </EmptyHeader>
        </Empty>
      )}

      {quickChats.map((chat) => (
        <QuickChatItem chat={chat} key={chat.id} />
      ))}
    </div>
  );
}
