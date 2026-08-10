"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import {
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type RegisterInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "@/lib/validations/auth.schema";

type ActionResult = { success: true } | { success: false; error: string };

export async function registerUser(input: RegisterInput): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing?.passwordHash) {
    return { success: false, error: "Ya existe una cuenta con ese email" };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: { name, passwordHash },
    });
  } else {
    await prisma.user.create({
      data: { name, email, passwordHash },
    });
  }

  return { success: true };
}

export async function requestPasswordReset(
  input: ForgotPasswordInput
): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  // Siempre devolvemos éxito, exista o no el usuario. Si dijéramos "ese
  // email no está registrado", cualquiera podría usar este formulario para
  // averiguar qué emails tienen cuenta — una fuga de información chica
  // pero real, conocida como "user enumeration".
  if (!user || !user.passwordHash) {
    return { success: true };
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // vence en 1 hora

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken: token, resetTokenExpiry: expiry },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  try {
    await sendPasswordResetEmail(user.email, resetUrl);
  } catch (error) {
    // No le mostramos el error real al usuario, por la misma razón de
    // arriba — pero sí lo logueamos nosotros para poder debuguear.
    console.error("Error enviando email de reseteo:", error);
  }

  return { success: true };
}

export async function resetPassword(
  input: ResetPasswordInput
): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const { token, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { resetToken: token } });

  if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
    return {
      success: false,
      error: "El link venció o no es válido. Pedí uno nuevo.",
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetToken: null, resetTokenExpiry: null },
  });

  return { success: true };
}
