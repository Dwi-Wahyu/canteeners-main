import { MessageCircleQuestionMark } from "lucide-react";

export default function EmptyChat() {
  return (
    <div className="p-5">
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="p-6 bg-gray-100 rounded-full">
          <MessageCircleQuestionMark className="size-12 text-gray-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Chat & Orderan</h3>
          <p className="text-sm text-muted-foreground px-10">
            Belum ada percakapan.
          </p>
        </div>
      </div>
    </div>
  );
}
