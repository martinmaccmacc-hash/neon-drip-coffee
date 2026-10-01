import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Remitente de pruebas de Resend: solo entrega a la cuenta registrada
export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await resend.emails.send({
    from: "Neon Drip Coffee <onboarding@resend.dev>",
    to,
    subject: "Reseteá tu contraseña — Neon Drip Coffee",
    html: `
      <div style="font-family: monospace; background:#0a0a0f; color:#e8e8f2; padding:32px; border-radius:12px;">
        <p style="color:#22d3ee; font-size:13px;">// reset-password</p>
        <h1 style="color:#e8e8f2; font-size:22px;">Reseteá tu contraseña</h1>
        <p style="color:#8b8ba3; font-size:14px; line-height:1.5;">
          Recibimos una solicitud para resetear tu contraseña en Neon Drip Coffee.
          Si no fuiste vos, podés ignorar este email tranquilo.
        </p>
        <a
          href="${resetUrl}"
          style="display:inline-block; margin-top:20px; background:#a855f7; color:#0a0a0f; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:bold; font-size:13px;"
        >
          Crear nueva contraseña
        </a>
        <p style="margin-top:24px; font-size:12px; color:#8b8ba3;">
          Este link vence en 1 hora.
        </p>
      </div>
    `,
  });
}
