import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Actividad } from '../models/actividad.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ActividadService {
  private http = inject(HttpClient);
  
  // Construcción URL usando la constante global
  private readonly URL_API = `${environment.apiUrl}/actividad`; 

 // Consultar actividades (Lista completa)
  listarTodas(): Observable<Actividad[]> {
    return this.http.get<Actividad[]>(`${this.URL_API}/actividades`);
  }

  // Consultar por id(Consultar una sola)
  consultarPorId(id: number): Observable<Actividad> {
    const params = new HttpParams().set('id', id);
    return this.http.get<Actividad>(this.URL_API, { params });
  }

  // Crear actividad
  crear(actividad: Actividad): Observable<Actividad> {
    return this.http.post<Actividad>(`${this.URL_API}/crear`, actividad);
  }

  // Actualizar actividad
  actualizar(actividad: Actividad): Observable<Actividad> {
    return this.http.put<Actividad>(this.URL_API, actividad);
  }

  // Eliminar actividad por id
  eliminar(id: number): Observable<void> {
    const params = new HttpParams().set('id', id);
    return this.http.delete<void>(this.URL_API, { params });
  }

}
