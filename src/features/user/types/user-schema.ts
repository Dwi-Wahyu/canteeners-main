import { ReportReason } from "@/generated/prisma";
import z from "zod";

export const ReportUserSchema = z.object({
  reported_id: z.string(),
  reasons: z.enum(ReportReason, {
    error: "Pilih setidaknya satu alasan pelaporan.",
  }),
  description: z.string().min(10, {
    message: "Deskripsi harus minimal 10 karakter.",
  }),
});

export type ReportUserInput = z.infer<typeof ReportUserSchema>;
