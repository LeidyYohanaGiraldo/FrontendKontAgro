import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TareaRealizada } from '../models/tarea-realizada.model';

@Injectable({ providedIn: 'root' })
export class TareaRealizadaService {
  private readonly http = inject(HttpClient);
  private readonly urlApi = `${environment.apiUrl}/tareas-realizadas`;

  listarTodas(): Observable<TareaRealizada[]> {
    return this.http.get<TareaRealizada[]>(this.urlApi);
  }

  listarActivas(): Observable<TareaRealizada[]> {
    return this.http.get<TareaRealizada[]>(`${this.urlApi}/activas`);
  }

  crear(tarea: TareaRealizada): Observable<TareaRealizada> {
    return this.http.post<TareaRealizada>(this.urlApi, tarea);
  }

  actualizar(tarea: TareaRealizada): Observable<TareaRealizada> {
    return this.http.put<TareaRealizada>(this.urlApi, tarea);
  }

  cambiarEstado(id: number, activo: boolean): Observable<TareaRealizada> {
    const params = new HttpParams().set('activo', activo);
    return this.http.patch<TareaRealizada>(`${this.urlApi}/${id}/estado`, null, { params });
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlApi}/${id}`);
  }
}
