export type EstadoLiquidacion = 'ACTIVA' | 'ANULADA';

export interface LiquidacionNomina {
  id?: number;
  idTrabajador: number;
  fechaInicialPagado: string;
  fechaFinalPagado: string;
  valorTotalTrabajado: number;
  valorTotalDescuentos: number;
  valorTotalPagado: number;
  fechaLiquidacion?: string | null;
  fechaAnulacion?: string | null;
  estado: EstadoLiquidacion;
  idsPagos?: number[];
  anulable: boolean;
}

export interface LiquidarNominaRequest {
  idTrabajador: number;
  idsPagos: number[];
}
