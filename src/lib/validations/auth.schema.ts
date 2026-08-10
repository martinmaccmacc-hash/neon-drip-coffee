import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Ingresá tu nombre completo"),
  email: z.string().email("Ingresá un email válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Ingresá un email válido"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Falta el token"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
