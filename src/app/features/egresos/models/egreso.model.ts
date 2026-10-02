export interface Egreso {
  id?: number;
  idActividad: number;
  nombreActividad?: string | null;
  fecha: string;
  valor: number;
}

export interface EgresoForm {
  id?: number;
  idActividad: number | null;
  fecha: string;
  valor: number | null;
}
