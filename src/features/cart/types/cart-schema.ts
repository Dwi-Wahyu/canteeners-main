import z from "zod";

export const AddCartItemNotesSchema = z.object({
  notes: z.string().min(1, { message: "Catatan wajib diisi." }),
  cart_item_id: z.string().min(1, { message: "ID cart item kosong." }),
});

export type AddCartItemNotesInput = z.infer<typeof AddCartItemNotesSchema>;
