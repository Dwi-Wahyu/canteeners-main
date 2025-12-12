import ClientChatPage from "@/features/chat/ui/client-chat-page";

export default async function ShopChatDetailPage({
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
