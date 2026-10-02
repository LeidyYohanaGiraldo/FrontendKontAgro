import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PagoTrabajador, PagoTrabajadorPayload } from '../models/pago-trabajador.model';

@Injectable({
  providedIn: 'root'
})
export class PagoTrabajadorService {
  private readonly http = inject(HttpClient);
  private readonly urlApi = `${environment.apiUrl}/registrar-pagos`;

  listarTodos(): Observable<PagoTrabajador[]> {
    return this.http.get<PagoTrabajador[]>(this.urlApi);
  }

  listarPendientesPorTrabajador(idTrabajador: number): Observable<PagoTrabajador[]> {
    return this.http.get<PagoTrabajador[]>(`${this.urlApi}/pendientes/trabajador/${idTrabajador}`);
  }

  crear(pago: PagoTrabajadorPayload): Observable<PagoTrabajador> {
    return this.http.post<PagoTrabajador>(this.urlApi, pago);
  }

  actualizar(pago: PagoTrabajadorPayload): Observable<PagoTrabajador> {
    return this.http.put<PagoTrabajador>(this.urlApi, pago);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlApi}/${id}`);
  }
}
