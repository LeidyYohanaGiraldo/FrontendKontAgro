import { DocumentoSoporte } from '../../../shared/models/documento-soporte.model';

export type OrigenMovimiento = 'INGRESO' | 'EGRESO' | 'NOMINA';

export interface MovimientoContable {
  fecha: string;
  origen: OrigenMovimiento;
  concepto: string;
  detalle: string;
  valor: number;
  tercero?: string | null;
  documento?: string | null;
  soportes: number;
}

export interface ObligacionPendiente {
  idPago: number;
  trabajador: string;
  tarea: string;
  fechaInicial: string;
  fechaFinal: string;
  diasTrabajados: string[];
  valorPagar: number;
  descuentos: number;
  valorNeto: number;
}

export interface ContabilidadResumen {
  fechaInicial: string;
  fechaFinal: string;
  generadoEn: string;
  totalIngresos: number;
  totalEgresosOperativos: number;
  totalNominaPagada: number;
  totalGastos: number;
  resultadoNeto: number;
  pagosPendientes: number;
  resultadoProyectado: number;
  movimientos: MovimientoContable[];
  obligacionesPendientes: ObligacionPendiente[];
  documentosSoporte: DocumentoSoporte[];
}
