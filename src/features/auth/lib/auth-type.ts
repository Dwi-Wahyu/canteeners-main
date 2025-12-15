import { z } from "zod";

export const LoginSchema = z.object({
  username: z
    .string()
    .min(1, { message: "Username wajib diisi." })
    .max(50, { message: "Username tidak lebih dari 50 karakter." })
    .nonempty({ error: "Username wajib diisi" }),
  password: z
    .string()
    .min(1, { message: "Kata sandi wajib diisi." })
    .max(100, { message: "Kata sandi tidak lebih dari 100 karakter." })
    .nonempty({ error: "Kata sandi wajib diisi" }),
  isGuest: z.boolean(),
  name: z.string(),
  firebaseUid: z.string(),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const ChangePasswordSchema = z
  .object({
    current_password: z
      .string()
      .min(1, { message: "Kata sandi saat ini harus diisi" }),
    new_password: z
      .string()
      .min(8, { message: "Kata sandi baru minimal 8 karakter" }),
    confirm_password: z
      .string()
      .min(1, { message: "Konfirmasi kata sandi harus diisi" }),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Kata sandi baru dan konfirmasi kata sandi tidak cocok",
    path: ["confirm_password"],
  });

export type ChangePasswordSchemaType = z.infer<typeof ChangePasswordSchema>;
