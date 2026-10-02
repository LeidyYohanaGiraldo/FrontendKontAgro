export function extraerMensajeBackend(body: unknown): string | null {
  if (body == null) return null;

  if (typeof body === 'string') {
    const texto = body.trim();
    if (!texto) return null;

    try {
      return extraerMensajeBackend(JSON.parse(texto)) ?? texto;
    } catch {
      return texto;
    }
  }

  if (typeof body !== 'object') return null;

  const respuesta = body as Record<string, unknown>;
  const message = respuesta['message'];
  if (typeof message === 'string' && message.trim()) {
    return message.trim();
  }

  const errors = respuesta['errors'];
  if (errors && typeof errors === 'object') {
    const mensajes = Object.values(errors as Record<string, unknown>)
      .flatMap(valor => Array.isArray(valor) ? valor : [valor])
      .filter((valor): valor is string => typeof valor === 'string' && !!valor.trim())
      .map(valor => valor.trim());

    if (mensajes.length) {
      return mensajes.join(' | ');
    }
  }

  return null;
}
