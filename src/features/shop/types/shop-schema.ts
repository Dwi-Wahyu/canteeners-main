import z from "zod";

const timeRegex = /^([01]\d|2[0-3]):?([0-5]\d)$/; // Format HH:MM 24-jam

export const UpdateShopSchema = z.object({
    id: z.string().min(1, { message: "ID shop harus diisi." }),
    name: z.string().min(1, { message: "Nama toko harus diisi." }),
    description: z.string().optional(),
    image_url: z.string(),
    order_mode: z.enum(["PREORDER_ONLY", "READY_ONLY", "BOTH"]),
    refund_disbursement_mode: z.enum(["CASH", "TRANSFER"]),
    open_time: z
        .string()
        .regex(timeRegex, { message: "Format waktu harus HH:MM yang valid." }) // Tambahkan regex
        .optional()
        .nullable(),
    close_time: z
        .string()
        .regex(timeRegex, { message: "Format waktu harus HH:MM yang valid." }) // Tambahkan regex
        .optional()
        .nullable(),
});

export type UpdateShopInput = z.infer<typeof UpdateShopSchema>;