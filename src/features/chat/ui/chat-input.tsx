import { useState, useCallback, useRef, useMemo, useEffect } from "react";
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
import { LocalStorageService } from "@/services/storage";
import { Attachment } from "@/features/chat/types";

function HeicPreview({ file }: { file: File }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    const convertHeic = async () => {
      try {
        let heic2anyFn: any;
        if (typeof window !== "undefined") {
          try {
            const module = await Function('return import("heic2any")')();
            heic2anyFn = module.default;
          } catch (e) {
            if (!(window as any).heic2any) {
              await new Promise<void>((resolve, reject) => {
                const script = document.createElement("script");
                script.src = "https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js";
                script.async = true;
                script.onload = () => resolve();
                script.onerror = () => reject(new Error("Failed to load heic2any from CDN"));
                document.body.appendChild(script);
              });
            }
            heic2anyFn = (window as any).heic2any;
          }
        }

        if (!heic2anyFn) {
          throw new Error("heic2any library is not loaded");
        }

        const converted = await heic2anyFn({
          blob: file,
          toType: "image/jpeg",
          quality: 0.6,
        });

        if (active) {
          const resultBlob = Array.isArray(converted) ? converted[0] : converted;
          objectUrl = URL.createObjectURL(resultBlob);
          setPreviewUrl(objectUrl);
          setLoading(false);
        }
      } catch (err) {
        console.error("HEIC conversion failed:", err);
        if (active) {
          setError(true);
          setLoading(false);
        }
      }
    };

    convertHeic();

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [file]);

  if (loading) {
    return (
      <div className="flex items-center justify-center size-full bg-muted animate-pulse rounded-md">
        <span className="text-[10px] text-muted-foreground font-medium text-center px-1">
          Converting...
        </span>
      </div>
    );
  }

  if (error || !previewUrl) {
    return (
      <div className="flex items-center justify-center size-full bg-destructive/10 text-destructive rounded-md">
        <span className="text-[9px] font-medium text-center px-1">HEIC Error</span>
      </div>
    );
  }

  return (
    <img
      src={previewUrl}
      alt={file.name}
      className="size-full object-cover rounded-md"
    />
  );
}

function StandardImagePreview({ file }: { file: File }) {
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  if (!url) return null;

  return (
    <img
      src={url}
      alt={file.name}
      className="size-full object-cover rounded-md"
    />
  );
}

const isHeic = (file: File) => {
  const ext = file.name.split(".").pop()?.toLowerCase();
  return ext === "heic" || ext === "heif" || file.type === "image/heic" || file.type === "image/heif";
};

export function ChatInput({
  chatId,
  currentUserId,
  opponentId,
  senderName,
}: {
  chatId: string;
  currentUserId: string;
  opponentId: string;
  senderName: string;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showQuickChats, setShowQuickChats] = useState(false);

  const storageService = useMemo(() => new LocalStorageService(), []);

  const { data: quickChats } = useQuery({
    queryKey: ["user-quick-chat", currentUserId],
    queryFn: () => getUserQuickChats(currentUserId),
    enabled: !!currentUserId,
  });

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

    // Set typing to false after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      updateTypingStatus(false);
    }, 2000);
  };

  const onUpload: NonNullable<FileUploadProps["onUpload"]> = useCallback(
    async (files, { onProgress, onSuccess, onError }) => {
      setIsUploading(true);
      try {
        await Promise.all(
          files.map(async (file) => {
            try {
              // Initial progress
              onProgress(file, 20);

              const subfolder = (file.type || "").startsWith("video/")
                ? "message-media-video"
                : "message-media-image";

              const filename = await storageService.uploadMedia(file, subfolder);

              onProgress(file, 100);

              // Store the uploaded filename and details on the file object
              // to be picked up by handleSend
              const ext = file.name.split(".").pop()?.toLowerCase();
              const isHeicFile = ext === "heic" || ext === "heif";
              (file as any).uploadInfo = {
                url: filename,
                path: "", // Empty path as per requirement
                contentType: file.type || (isHeicFile ? "image/heic" : "image/jpeg"),
                size: file.size,
              } as Attachment;

              onSuccess(file);
            } catch (error) {
              const errorMessage =
                error instanceof Error ? error.message : "Upload failed";
              onError(file, new Error(errorMessage));
              toast.error(`Gagal mengunggah ${file.name}: ${errorMessage}`);
            }
          })
        );
      } catch (error) {
        console.error("Unexpected error during upload:", error);
      } finally {
        setIsUploading(false);
      }
    },
    [storageService]
  );

  const onFileReject = useCallback((file: File, message: string) => {
    toast.error(`${file.name} ditolak: ${message}`);
  }, []);

  async function handleSend(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if ((!text.trim() && attachments.length === 0) || loading || isUploading)
      return;

    setLoading(true);
    try {
      // Prepare attachments data from uploaded files
      const mediaData: Attachment[] = attachments
        .map((file: any) => file.uploadInfo)
        .filter((info): info is Attachment => !!info?.url);

      const messageData = {
        senderId: currentUserId,
        text: text.trim(),
        type: mediaData.length > 0 ? "ATTACHMENT" : "TEXT",
        attachments: mediaData,
        readBy: [currentUserId],
        createdAt: serverTimestamp(),
      };

      // Add to Messages subcollection
      await addDoc(collection(db, "chats", chatId, "messages"), messageData);

      // Update Parent Chat Document (Metadata)
      const chatRef = doc(db, "chats", chatId);
      await updateDoc(chatRef, {
        lastMessage: text.trim()
          ? text.trim()
          : mediaData.length > 0
          ? "Mengirim lampiran"
          : "",
        lastMessageAt: serverTimestamp(),
        lastMessageType: text.trim() ? "TEXT" : "ATTACHMENTS",
        lastMessageSenderId: currentUserId,
        [`unreadCounts.${opponentId}`]: increment(1),
      });

      // Reset state
      setText("");
      setAttachments([]);
      setShowQuickChats(false);
    } catch (error) {
      console.error("Gagal mengirim pesan:", error);
      toast.error("Gagal mengirim pesan");
    } finally {
      setLoading(false);
    }
  }

  // Calculate grid columns for preview
  const gridCols = attachments.length === 1 ? "grid-cols-1" : "grid-cols-2";

  return (
    <div className="p-5 fixed bottom-0 left-0 right-0">
      <FileUpload
        value={attachments}
        onValueChange={setAttachments}
        onUpload={onUpload}
        onFileReject={onFileReject}
        maxFiles={4}
        maxSize={10 * 1024 * 1024} // Adjusted to 10MB to accommodate video
        accept=".jpg,.jpeg,.png,.webp,.heic,.JPG,.JPEG,.PNG,.WEBP,.HEIC,image/jpeg,image/png,image/webp,image/heic,image/heif"
        onFileValidate={(file) => {
          const allowedExtensions = ["jpg", "jpeg", "png", "webp", "heic", "heif"];
          const ext = file.name.split(".").pop()?.toLowerCase();
          if (!ext || !allowedExtensions.includes(ext)) {
            return "Hanya file gambar (JPG, JPEG, PNG, WEBP, HEIC) yang diperbolehkan.";
          }
          return null;
        }}
        className="relative w-full"
        multiple
        disabled={loading || isUploading}
      >
        <FileUploadDropzone className="fixed inset-0 z-50 opacity-0 hidden data-dragging:flex data-dragging:opacity-100 bg-background/80 backdrop-blur-sm transition-all items-center justify-center">
          <div className="text-center font-medium">
            <Upload className="mx-auto h-12 w-12 mb-4 text-muted-foreground" />
            <p>Lepaskan file untuk mengunggah</p>
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
                    <FileUploadItemPreview
                      className="size-16 shrink-0 rounded-md object-cover"
                      render={(file) => {
                        if (isHeic(file)) {
                          return <HeicPreview file={file} />;
                        }
                        return <StandardImagePreview file={file} />;
                      }}
                    />
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
            <div className="flex flex-row gap-4 mb-2 w-full overflow-x-auto pb-2">
              {quickChats.map((chat, idx) => (
                <button
                  key={idx}
                  className="w-fit whitespace-nowrap flex gap-1 items-center px-3 py-2 bg-secondary/70 backdrop-blur-sm shadow-sm rounded-lg cursor-pointer hover:bg-secondary transition-colors"
                  onClick={() => setText(chat.message)}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm text-muted-foreground">
                    {chat.message}
                  </span>
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
