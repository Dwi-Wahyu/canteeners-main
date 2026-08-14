import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  SendIcon,
  Paperclip,
  X,
  Upload,
  MessageCircle,
  MessagesSquare,
} from "lucide-react";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadItemProgress,
  FileUploadList,
  type FileUploadProps,
  FileUploadTrigger,
} from "@/components/ui/file-upload";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { getUserQuickChats } from "../lib/chat-queries";
import { useSocket } from "@/lib/realtime/socket-context";
import { useSession } from "next-auth/react";

export function ChatInput({
  chatId,
  currentUserId,
  opponentId,
}: {
  chatId: string;
  currentUserId: string;
  opponentId: string;
}) {
  const { data: session } = useSession();
  const socket = useSocket();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showQuickChats, setShowQuickChats] = useState(false);

  const { data: quickChats } = useQuery({
    queryKey: ["user-quick-chat", currentUserId],
    queryFn: () => getUserQuickChats(currentUserId),
    enabled: !!currentUserId,
  });

  const typingTimeoutRef = useRef<NodeJS.Timeout>(null);

  const updateTypingStatus = (isTyping: boolean) => {
    if (socket) {
      socket.send({ type: "typing", chatId, isTyping });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    updateTypingStatus(true);

    typingTimeoutRef.current = setTimeout(() => {
      updateTypingStatus(false);
    }, 2000);
  };

  const onUpload: NonNullable<FileUploadProps["onUpload"]> = useCallback(
    async (files, { onProgress, onSuccess, onError }) => {
      try {
        setIsUploading(true);
        const uploadPromises = files.map(async (file) => {
          try {
            const totalChunks = 5;
            for (let i = 0; i < totalChunks; i++) {
              onProgress(file, ((i + 1) / totalChunks) * 100);
              await new Promise((resolve) => setTimeout(resolve, 100));
            }

            const path = file.type.startsWith("video/")
              ? "message-media-video"
              : "message-media-image";
            const formData = new FormData();
            formData.append("path", path);
            formData.append("file", file);

            const res = await fetch("/api/upload", {
              method: "POST",
              body: formData,
            });

            if (!res.ok) {
              throw new Error("Upload failed");
            }

            const blob = await res.json();
            if (blob.data?.url) {
              blob.filename = blob.data.url.split("/").pop();
            }

            Object.assign(file, { blobResult: blob });
            onSuccess(file);
          } catch (error) {
            onError(
              file,
              error instanceof Error ? error : new Error("Upload failed")
            );
            toast.error(`Failed to upload ${file.name}`);
          }
        });

        await Promise.all(uploadPromises);
      } catch (error) {
        console.error("Unexpected error during upload:", error);
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  const onFileReject = useCallback((file: File, message: string) => {
    toast.error(`${file.name} was rejected: ${message}`);
  }, []);

  async function handleSend(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if ((!text.trim() && attachments.length === 0) || loading || isUploading)
      return;

    setLoading(true);
    try {
      const mediaData = attachments
        .map((file: any) => {
          const blob = file.blobResult;
          return {
            url: blob?.filename || blob?.data?.url?.split("/").pop() || blob?.url,
            path: blob?.pathname || blob?.data?.url,
            contentType: blob?.contentType || file.type,
            size: blob?.size || file.size,
          };
        })
        .filter((m) => m.url);

      const backendUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
      const res = await fetch(`${backendUrl}/chats/${chatId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: session?.user?.accessToken
            ? `Bearer ${session.user.accessToken}`
            : "",
        },
        body: JSON.stringify({
          text: text.trim() || undefined,
          type: mediaData.length > 0 ? "ATTACHMENT" : "TEXT",
          attachments: mediaData,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      updateTypingStatus(false);
      setText("");
      setAttachments([]);
    } catch (error) {
      console.error("Gagal mengirim pesan:", error);
      toast.error("Gagal mengirim pesan");
    } finally {
      setLoading(false);
    }
  }

  const gridCols =
    attachments.length === 1
      ? "grid-cols-1"
      : "grid-cols-2";

  return (
    <div className="p-5 fixed bottom-0 left-0 right-0">
      <FileUpload
        value={attachments}
        onValueChange={setAttachments}
        onUpload={onUpload}
        onFileReject={onFileReject}
        maxFiles={4}
        maxSize={5 * 1024 * 1024}
        className="relative w-full"
        multiple
        disabled={loading || isUploading}
      >
        <FileUploadDropzone className="fixed inset-0 z-50 opacity-0 hidden data-dragging:flex data-dragging:opacity-100 bg-background/80 backdrop-blur-sm transition-all items-center justify-center">
          <div className="text-center font-medium">
            <Upload className="mx-auto h-12 w-12 mb-4 text-muted-foreground" />
            <p>Drop files here to upload</p>
          </div>
        </FileUploadDropzone>

        <div className="relative flex w-full flex-col gap-2 rounded-md border border-input bg-card px-3 py-2 shadow-sm focus-within:ring-1 focus-within:ring-ring">
          {attachments.length > 0 && (
            <FileUploadList
              orientation="vertical"
              className={`grid ${gridCols} gap-2 mb-2 w-full`}
            >
              {attachments.map((file, index) => (
                <FileUploadItem
                  key={index}
                  value={file}
                  className="w-full p-2 bg-secondary/50 rounded-md"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileUploadItemPreview className="size-16 shrink-0 rounded-md object-cover" />
                    <div className="flex-1 min-w-0">
                      <FileUploadItemMetadata size="sm" className="truncate" />
                      <FileUploadItemProgress />
                    </div>
                    <FileUploadItemDelete asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 size-8 text-destructive hover:text-destructive"
                      >
                        <X className="size-4" />
                      </Button>
                    </FileUploadItemDelete>
                  </div>
                </FileUploadItem>
              ))}
            </FileUploadList>
          )}

          {showQuickChats && quickChats && quickChats.length > 0 && (
            <div className="flex flex-row gap-4 mb-2 w-full">
              {quickChats.map((chat, idx) => (
                <button
                  key={idx}
                  className="w-fit flex gap-1 items-center px-3 py-2 bg-secondary/70 backdrop-blur-sm shadow-sm rounded-lg cursor-pointer"
                  onClick={() => setText(chat.message)}
                >
                  <MessageCircle className="w-4 h-4" />
                  <h1 className="text-sm text-muted-foreground">
                    {chat.message}
                  </h1>
                </button>
              ))}
            </div>
          )}

          <Textarea
            value={text}
            onChange={handleInputChange}
            placeholder="Tulis pesan..."
            className="min-h-10 w-full resize-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 focus-visible:outline-none"
            disabled={loading || isUploading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          <div className="flex items-center justify-end gap-1.5 pt-2">
            <Button asChild size={"icon-lg"} variant={"ghost"}>
              <FileUploadTrigger className="cursor-pointer">
                <Paperclip />
              </FileUploadTrigger>
            </Button>

            {quickChats && quickChats.length > 0 && (
              <Button
                onClick={() => setShowQuickChats(!showQuickChats)}
                variant={showQuickChats ? "default" : "ghost"}
                size={"icon-lg"}
                type="button"
              >
                <MessagesSquare />
              </Button>
            )}

            <Button
              onClick={() => handleSend()}
              size={"icon-lg"}
              disabled={
                loading ||
                isUploading ||
                (!text.trim() && attachments.length === 0)
              }
            >
              <SendIcon />
            </Button>
          </div>
        </div>
      </FileUpload>
    </div>
  );
}
