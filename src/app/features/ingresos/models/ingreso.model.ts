export interface Ingreso {
  id?: number;
  idActividad: number;
  nombreActividad?: string | null;
  fecha: string;
  valor: number;
}

export interface IngresoForm {
  id?: number;
  idActividad: number | null;
  fecha: string;
  valor: number | null;
}
