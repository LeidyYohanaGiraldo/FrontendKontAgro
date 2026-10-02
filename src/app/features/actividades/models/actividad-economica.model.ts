import { TipoMovimiento } from './actividad.model';

export interface ActividadEconomica {
  id: number;
  nombreActividadEconomica: string;
  tipoMovimiento?: TipoMovimiento | null;
}
