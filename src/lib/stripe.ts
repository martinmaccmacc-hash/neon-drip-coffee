import Stripe from "stripe";

// No fijamos "apiVersion" a propósito — las versiones recientes del SDK
// de Stripe ya vienen ancladas a una versión probada internamente, así
// que alcanza con pasar la clave secreta.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
