import { z } from "zod";

export const QuickChatSchema = z.object({
    message: z.string().min(1, "Tolong isi pesan"),
    user_id: z.string(),
});

export type QuickChatInput = z.infer<typeof QuickChatSchema>;