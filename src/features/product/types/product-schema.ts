import { z } from "zod";

// =========================================
// 1. PRODUCT ENTITY
// =========================================

const BaseProductSchema = z.object({
    name: z.string().min(1, { message: "Nama produk harus diisi." }),
    description: z.string().optional(),
    image_url: z.string(),
    price: z.string().min(1, { message: "Harga produk harus diisi." }),
    cost: z.string().optional().nullable(),
    shop_id: z.string().min(1, { message: "ID kedai harus diisi." }),
    categories: z.array(
        z.object({
            label: z.string(),
            value: z.string(),
        })
    ),
});

export const CreateProductSchema = BaseProductSchema;
export type CreateProductInput = z.infer<typeof CreateProductSchema>;

export const EditProductSchema = BaseProductSchema.extend({
    id: z.string().min(1, { message: "ID produk diperlukan." }),
});
export type EditProductInput = z.infer<typeof EditProductSchema>;

// =========================================
// 2. PRODUCT OPTION ENTITY
// =========================================

const BaseProductOptionSchema = z.object({
    option: z
        .string({ error: "Nama pilihan harus diisi." })
        .min(1, { message: "Nama pilihan harus diisi." }),
    type: z.enum(["SINGLE", "MULTIPLE"]),
    is_required: z.boolean(),
});

export const CreateProductOptionSchema = BaseProductOptionSchema.extend({
    product_id: z.string().min(1, { message: "Product ID diperlukan." }),
});
export type CreateProductOptionInput = z.infer<
    typeof CreateProductOptionSchema
>;

export const EditProductOptionSchema = BaseProductOptionSchema.extend({
    id: z.string().min(1, { message: "ID Opsi diperlukan." }),
    is_required: z.boolean(),
});
export type EditProductOptionInput = z.infer<typeof EditProductOptionSchema>;

// =========================================
// 3. PRODUCT OPTION VALUE ENTITY
// =========================================

const BaseProductOptionValueSchema = z.object({
    value: z
        .string({ error: "Nama nilai harus diisi." })
        .min(1, { message: "Nama nilai harus diisi." }),
    additional_price: z.string().nullable().optional(),
    image_url: z.string().nullable().optional(),
});

export const CreateProductOptionValueSchema = BaseProductOptionValueSchema.extend({
    product_option_id: z.string().min(1, { message: "Option ID diperlukan." }),
});
export type CreateProductOptionValueInput = z.infer<
    typeof CreateProductOptionValueSchema
>;

export const EditProductOptionValueSchema = BaseProductOptionValueSchema.extend({
    id: z.string().min(1, { message: "ID Value diperlukan." }),
});
export type EditProductOptionValueInput = z.infer<
    typeof EditProductOptionValueSchema
>;