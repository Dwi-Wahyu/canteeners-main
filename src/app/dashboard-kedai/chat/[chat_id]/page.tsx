import ClientChatPage from "@/features/chat/ui/client-chat-page";

export default async function ShopChatDetailPage({
  params,
}: {
  params: Promise<{ chat_id: string }>;
}) {
  const { chat_id } = await params;

  return (
    <div>
      <ClientChatPage chatId={chat_id} />
    </div>
  );
}
