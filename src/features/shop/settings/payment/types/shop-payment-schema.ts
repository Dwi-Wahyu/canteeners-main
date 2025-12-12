import z from "zod";

const paymentMethodEnum = z.enum(["QRIS", "BANK_TRANSFER", "CASH"]);

export const PaymentSchema = z.object({
    method: paymentMethodEnum,

    qr_url: z.string().optional().nullable(),
    account_number: z.string().optional().nullable(),
    note: z.string().optional(),
    additional_price: z.string().optional(),
});

export type PaymentSchemaInput = z.infer<typeof PaymentSchema>;
