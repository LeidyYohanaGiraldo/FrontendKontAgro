export enum TipoMovimiento {
  INGRESO = 'INGRESO',
  EGRESO = 'EGRESO'
}

export interface TipoMovimientoOpcion {
  valor: TipoMovimiento;
  etiqueta: string;
}

export interface Actividad {
  idActividad?: number;
  nombreActividad: string;
  /**
   * Se conserva para compatibilidad con respuestas históricas del backend.
   * El formulario actual clasifica por tipoMovimiento y no expone este ID.
   */
  idActividadEconomica?: number;
  nombreActividadEconomica?: string;
  tipoMovimiento?: TipoMovimiento | null;
}
