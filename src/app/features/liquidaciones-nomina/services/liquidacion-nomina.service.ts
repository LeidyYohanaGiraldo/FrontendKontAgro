import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PagoTrabajador } from '../../pagos-trabajadores/models/pago-trabajador.model';
import { LiquidacionNomina, LiquidarNominaRequest } from '../models/liquidacion-nomina.model';

@Injectable({
  providedIn: 'root'
})
export class LiquidacionNominaService {
  private readonly http = inject(HttpClient);
  private readonly urlApi = `${environment.apiUrl}/liquidaciones`;

  listarTodas(): Observable<LiquidacionNomina[]> {
    return this.http.get<LiquidacionNomina[]>(this.urlApi);
  }

  liquidar(request: LiquidarNominaRequest): Observable<LiquidacionNomina> {
    return this.http.post<LiquidacionNomina>(this.urlApi, request);
  }

  listarPagos(idLiquidacion: number): Observable<PagoTrabajador[]> {
    return this.http.get<PagoTrabajador[]>(`${this.urlApi}/${idLiquidacion}/pagos`);
  }

  anular(idLiquidacion: number): Observable<LiquidacionNomina> {
    return this.http.put<LiquidacionNomina>(`${this.urlApi}/${idLiquidacion}/anular`, {});
  }
}
