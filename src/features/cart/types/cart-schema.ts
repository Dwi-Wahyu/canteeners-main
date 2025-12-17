import z from "zod";

export const AddCartItemNoteSchema = z.object({
  notes: z.string().min(1, { message: "Catatan wajib diisi." }),
  cart_item_id: z.string().min(1, { message: "ID cart item kosong." }),
});

export type AddCartItemNoteInput = z.infer<typeof AddCartItemNoteSchema>;
