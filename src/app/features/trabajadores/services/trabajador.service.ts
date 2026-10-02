import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Trabajador } from '../models/trabajador.model';

@Injectable({
  providedIn: 'root'
})
export class TrabajadorService {
  private readonly http = inject(HttpClient);
  private readonly urlApi = `${environment.apiUrl}/trabajadores`;

  listarTodos(): Observable<Trabajador[]> {
    return this.http.get<Trabajador[]>(this.urlApi);
  }

  crear(trabajador: Trabajador): Observable<Trabajador> {
    return this.http.post<Trabajador>(this.urlApi, trabajador);
  }

  actualizar(trabajador: Trabajador): Observable<Trabajador> {
    return this.http.put<Trabajador>(this.urlApi, trabajador);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlApi}/${id}`);
  }
}
