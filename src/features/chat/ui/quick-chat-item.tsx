"use client";


import {
    Item,
    ItemActions,
    ItemContent,
    ItemMedia,
    ItemTitle,
} from "@/components/ui/item";
import { useState } from "react";
import { Loader, MessageCircle, Trash } from "lucide-react";
import { QuickChat } from "@/generated/prisma";
import { deleteQuickChat } from "../lib/chat-actions";

export function QuickChatItem({ chat }: { chat: QuickChat }) {
    const [deleting, setDeleting] = useState(false);

    async function handleDelete(id: number) {
        setDeleting(true);
        await deleteQuickChat(id);
        setDeleting(false);
    }

    return (
        <Item key={chat.id} variant={"outline"} className="mt-4">
            <ItemMedia>
                <MessageCircle />
            </ItemMedia>
            <ItemContent>
                <ItemTitle>{chat.message}</ItemTitle>
            </ItemContent>
            <ItemActions
                className="cursor-pointer"
                onClick={() => handleDelete(chat.id)}
            >
                {deleting ? (
                    <Loader className="animate-spin" />
                ) : (
                    <Trash className="w-5 h-5" />
                )}
            </ItemActions>
        </Item>
    );
}