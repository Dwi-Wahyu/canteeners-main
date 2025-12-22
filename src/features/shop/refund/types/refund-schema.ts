import { z } from "zod";

// Helper to check if reason requires item selection
const ITEM_LEVEL_REASONS = [
  "DAMAGED_FOOD",
  "MISSING_ITEM",
  "WRONG_ORDER",
] as const;

export const RefundRequestSchema = z
  .object({
    order_id: z.string(),
    reason: z.enum(
      ["LATE_DELIVERY", "WRONG_ORDER", "DAMAGED_FOOD", "MISSING_ITEM", "OTHER"],
      {
        message: "Alasan refund tidak valid.",
      }
    ),
    description: z
      .string()
      .min(10, { message: "Deskripsi minimal 10 karakter." })
      .max(500, { message: "Deskripsi maksimal 500 karakter." })
      .optional(),
    complaint_proof_url: z
      .string()
      .url({ message: "URL bukti tidak valid." })
      .optional(),
    disbursement_mode: z.enum(["CASH", "TRANSFER"], {
      message: "Mode pengembalian dana tidak valid.",
    }),
    // For item-level refunds (DAMAGED_FOOD, MISSING_ITEM, WRONG_ORDER)
    affected_item_ids: z.array(z.string()).optional(),
    // For manual amount refunds (LATE_DELIVERY, OTHER)
    amount: z
      .number()
      .positive({ message: "Jumlah refund harus lebih dari 0." })
      .optional(),
  })
  .superRefine((data, ctx) => {
    const isItemLevel = ITEM_LEVEL_REASONS.includes(data.reason as any);

    if (isItemLevel) {
      // Item-level refunds require affected_item_ids
      if (!data.affected_item_ids || data.affected_item_ids.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Pilih minimal 1 item yang bermasalah.",
          path: ["affected_item_ids"],
        });
      }
      // Amount should not be provided by user for item-level
      if (data.amount !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Jumlah refund akan dihitung otomatis dari item yang dipilih.",
          path: ["amount"],
        });
      }
    } else {
      // Manual amount refunds require amount
      if (!data.amount) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Jumlah refund harus diisi.",
          path: ["amount"],
        });
      }
      // affected_item_ids should not be used
      if (data.affected_item_ids && data.affected_item_ids.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Pilihan item tidak diperlukan untuk alasan refund ini.",
          path: ["affected_item_ids"],
        });
      }
    }
  });

export type RefundRequestInput = z.infer<typeof RefundRequestSchema>;

export const UpdateRefundStatusSchema = z.object({
  refund_id: z.string(),
  status: z.enum(["APPROVED", "REJECTED"], {
    message: "Status tidak valid.",
  }),
  rejected_reason: z.string(),
});

export type UpdateRefundStatusInput = z.infer<typeof UpdateRefundStatusSchema>;

export const ProcessRefundSchema = z.object({
  refund_id: z.string(),
  disbursement_proof_url: z
    .string()
    .url({ message: "URL bukti tidak valid." })
    .optional(),
});

export type ProcessRefundInput = z.infer<typeof ProcessRefundSchema>;

export const CancelRefundSchema = z.object({
  refund_id: z.string(),
});

export type CancelRefundInput = z.infer<typeof CancelRefundSchema>;

export const EscalateRefundSchema = z.object({
  refund_id: z.string(),
  escalated_reason: z
    .string()
    .min(10, { message: "Alasan eskalasi minimal 10 karakter." })
    .max(500, { message: "Alasan eskalasi maksimal 500 karakter." }),
});

export type EscalateRefundInput = z.infer<typeof EscalateRefundSchema>;
