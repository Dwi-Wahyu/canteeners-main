import ClientChatPage from "./client-chat-page";

export default async function ChatDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <ClientChatPage chatId={id} />
    </div>
  );
}
