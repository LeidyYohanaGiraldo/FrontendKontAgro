import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ContabilidadResumen } from '../models/contabilidad.model';

@Injectable({ providedIn: 'root' })
export class ContabilidadService {
  private readonly http = inject(HttpClient);
  private readonly urlApi = `${environment.apiUrl}/contabilidad`;

  consultarResumen(fechaInicial: string, fechaFinal: string): Observable<ContabilidadResumen> {
    const params = new HttpParams()
      .set('fechaInicial', fechaInicial)
      .set('fechaFinal', fechaFinal);
    return this.http.get<ContabilidadResumen>(`${this.urlApi}/resumen`, { params });
  }

  descargarReportePdf(fechaInicial: string, fechaFinal: string): Observable<Blob> {
    const params = new HttpParams()
      .set('fechaInicial', fechaInicial)
      .set('fechaFinal', fechaFinal);
    return this.http.get(`${this.urlApi}/reporte-pdf`, { params, responseType: 'blob' });
  }
  descargarPaqueteContador(fechaInicial: string, fechaFinal: string): Observable<Blob> {
    const params = new HttpParams()
      .set('fechaInicial', fechaInicial)
      .set('fechaFinal', fechaFinal);
    return this.http.get(`${this.urlApi}/paquete-contador`, { params, responseType: 'blob' });
  }

}
