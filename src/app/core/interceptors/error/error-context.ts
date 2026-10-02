import { HttpContextToken } from '@angular/common/http';

/**
 * Permite que solicitudes de infraestructura (por ejemplo, renovación de
 * sesión en segundo plano) gestionen su error localmente sin disparar una
 * alerta global duplicada.
 */
export const SUPPRESS_GLOBAL_HTTP_ERROR = new HttpContextToken<boolean>(() => false);
