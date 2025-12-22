import { useState, useCallback, useRef } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendIcon, Paperclip, X, Upload } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { format } from "date-fns";
import { uuidv4 } from "zod";

export function ChatInput({
  chatId,
  currentUserId,
  opponentId,
}: {
  chatId: string;
  currentUserId: string;
  opponentId: string;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);

  const typingTimeoutRef = useRef<NodeJS.Timeout>(null);

  const updateTypingStatus = async (isTyping: boolean) => {
    try {
      const chatRef = doc(db, "chats", chatId);
      await updateDoc(chatRef, {
        [`typing.${currentUserId}`]: isTyping,
      });
    } catch (error) {
      console.error("Error updating typing status:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set typing to true immediately
    updateTypingStatus(true);

    // Set typing to false after 3 seconds of inactivity
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
            // Simulate progress
            const totalChunks = 5;
            for (let i = 0; i < totalChunks; i++) {
              onProgress(file, ((i + 1) / totalChunks) * 100);
              await new Promise((resolve) => setTimeout(resolve, 100));
            }

            // The actual upload will happen when sending the message or we can do it here.
            // However, standard FileUpload component typically handles visual state.
            // If we want to upload IMMEDIATELY upon selection (like example), we do it now.
            // But to match the requirement of "users can send more 1 - 4 media", usually we upload first then send.
            // Let's stick to the example pattern: upload immediately to get the URL?
            // Wait, the example just mimics upload progress but doesn't show the API call in the `onUpload` function of existing example?
            // Ah, the existing example chat-input-example.tsx lines 69-103 ONLY SIMULATES progress.
            // I need to actually upload to /api/upload.

            const formData = new FormData();
            formData.append("file", file);
            // Generate filename: chat-attachments/{date}_{uuid}
            const dateStr = format(new Date(), "yyyy-MM-dd");
            const filename = `chat-attachments/${dateStr}_${uuidv4()}`;
            formData.append("filename", filename);

            const res = await fetch("/api/upload", {
              method: "POST",
              body: formData,
            });

            if (!res.ok) {
              throw new Error("Upload failed");
            }

            const blob = await res.json();
            // We need to attach the blob url/details to the file object so we can access it later on submit.
            // Since File object is read-only, we might need a separate state or augment it if possible,
            // but better: `setAttachments` tracks the Files.
            // The `FileUpload` component manages the UI state based on these file objects.
            // We need to store the upload result.
            // Let's attach it to the file instance directly as a custom property if we can,
            // or maintain a map of File -> BlobResult.

            // Javascript allows adding properties to objects.
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
      // Prepare attachments data
      const mediaData = attachments
        .map((file: any) => {
          const blob = file.blobResult;
          return {
            url: blob?.url,
            path: blob?.pathname, // Vercel blob returns pathname
            contentType: blob?.contentType || file.type,
            size: blob?.size || file.size,
          };
        })
        .filter((m) => m.url); // Ensure we only send successfully uploaded ones

      // Tambahkan ke Subcollection Messages
      const messageData = {
        senderId: currentUserId,
        text: text,
        type: mediaData.length > 0 ? "ATTACHMENT" : "TEXT",
        // Let's keep existing logic but add media field.
        // Note: User request says "users can send more 1 - 4 media in single message"
        // And "no need to store the messages media to postgresql prisma", implying we just store in the message doc.
        attachments: mediaData,
        readBy: [currentUserId],
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "chats", chatId, "messages"), messageData);

      // Update Parent Chat Document (Metadata)
      const chatRef = doc(db, "chats", chatId);

      await updateDoc(chatRef, {
        lastMessage: text
          ? text
          : mediaData.length > 0
          ? "Mengirim lampiran"
          : "",
        lastMessageAt: serverTimestamp(),
        lastMessageType: text ? "TEXT" : "ATTACHMENT",
        lastMessageSenderId: currentUserId,

        [`unreadCounts.${opponentId}`]: increment(1),
      });

      setText("");
      setAttachments([]);
    } catch (error) {
      console.error("Gagal mengirim pesan:", error);
    } finally {
      setLoading(false);
    }
  }

  // Calculate grid columns for preview
  const gridCols =
    attachments.length === 1
      ? "grid-cols-1"
      : attachments.length === 2
      ? "grid-cols-2"
      : "grid-cols-2";
  // User asked for "grid column" based on media sum. 1-4.
  // 3 could be 2 cols (1 occupies full width? or just 3 grid). Let's use simple grid.

  return (
    <div className="p-5 fixed bottom-0 left-0 right-0">
      <FileUpload
        value={attachments}
        onValueChange={setAttachments}
        onUpload={onUpload}
        onFileReject={onFileReject}
        maxFiles={4}
        maxSize={5 * 1024 * 1024} // 5MB
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
          {/* Preview Grid */}
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

          <Textarea
            value={text}
            onChange={handleInputChange} // Use the new handleInputChange function
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground shrink-0"
                >
                  <Paperclip className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <FileUploadTrigger className="w-full cursor-pointer">
                      <Upload className="mr-2 h-4 w-4" />
                      <span>Upload Image</span>
                    </FileUploadTrigger>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              onClick={() => handleSend()}
              size="icon"
              className="size-8"
              disabled={
                loading ||
                isUploading ||
                (!text.trim() && attachments.length === 0)
              }
            >
              <SendIcon className="size-4" />
            </Button>
          </div>
        </div>
      </FileUpload>
    </div>
  );
}
