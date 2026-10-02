export type EstadoPago = 'PENDIENTE' | 'PAGADO';

export interface PagoTrabajador {
  id?: number;
  idTrabajador: number;
  idTarea: number | null;
  nombreTarea?: string | null;
  fechaInicial: string;
  fechaFinal: string;
  diasTrabajados: string[];
  valorPagar: number | null;
  valorDescuentos: number;
  observaciones: string | null;
  estado: EstadoPago;
  tieneHistorialNomina: boolean;
}

export interface PagoTrabajadorForm {
  id?: number;
  idTrabajador: number | null;
  idTarea: number | null;
  diasTrabajados: string[];
  diaAAgregar: string;
  rangoDesde: string;
  rangoHasta: string;
  valorPagar: number | null;
  valorDescuentos: number | null;
  observaciones: string | null;
}

export interface PagoTrabajadorPayload {
  id?: number;
  idTrabajador: number;
  idTarea: number;
  diasTrabajados: string[];
  valorPagar: number;
  valorDescuentos: number;
  observaciones: string | null;
}
