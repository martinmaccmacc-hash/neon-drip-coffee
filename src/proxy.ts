import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // Placeholder por ahora — acá va la validación de sesión/rol
  // cuando conectemos Auth.js para proteger /account y /admin.
  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};