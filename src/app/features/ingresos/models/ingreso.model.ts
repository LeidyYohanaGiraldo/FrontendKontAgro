import { Actividad } from "../../actividades/models/actividad.model";

export interface Ingreso {
    
  id?: number; 
  idActividad: number; 
  fecha: string; 
  valor: number; 
}