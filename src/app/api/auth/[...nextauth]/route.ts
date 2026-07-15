import { handlers } from "@/lib/auth";

// Auth.js maneja todas las rutas de autenticación (login, logout, callbacks
// de OAuth si algún día agregamos, etc.) internamente — nosotros solo
// necesitamos reexportar sus handlers para los métodos GET y POST.
export const { GET, POST } = handlers;
