/**
 * Tipo de retorno estándar para Server Actions.
 * Permite al frontend mostrar errores con toast sin que Next.js los bloquee en producción.
 */
export type ActionResult = { success: true } | { success: false; error: string };
