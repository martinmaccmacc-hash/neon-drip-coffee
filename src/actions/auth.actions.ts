"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  registerSchema,
  type RegisterInput,
} from "@/lib/validations/auth.schema";

type RegisterResult = { success: true } | { success: false; error: string };

export async function registerUser(
  input: RegisterInput
): Promise<RegisterResult> {
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

  // bcrypt.hash transforma la contraseña en un texto irreversible. Nunca
  // guardamos la contraseña real en la base de datos.
  const passwordHash = await bcrypt.hash(password, 10);

  if (existing) {
    // Ya existía como "invitado" (por ejemplo, hizo un pedido de Click &
    // Collect antes sin crear cuenta) — le agregamos nombre y contraseña
    // para que ahora sí pueda loguearse y ver ese historial.
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
