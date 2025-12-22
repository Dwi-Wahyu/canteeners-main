import { z } from "zod";

export const ShopComplaintSchema = z.object({
  cause: z
    .string()
    .min(10, { message: "Deskripsi keluhan minimal 10 karakter." })
    .max(500, { message: "Deskripsi keluhan maksimal 500 karakter." }),
  proof_url: z.string().optional(),
  order_id: z.string(),
});

export type ShopComplaintInput = z.infer<typeof ShopComplaintSchema>;

export const UpdateComplaintSchema = z.object({
  complaint_id: z.string(),
  feedback: z
    .string()
    .min(10, { message: "Tanggapan minimal 10 karakter." })
    .max(500, { message: "Tanggapan maksimal 500 karakter." }),
  status: z.enum(["UNDER_REVIEW", "RESOLVED", "REJECTED"], {
    message: "Status tidak valid.",
  }),
});

export type UpdateComplaintInput = z.infer<typeof UpdateComplaintSchema>;
