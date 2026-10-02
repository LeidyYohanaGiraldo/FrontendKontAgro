import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ActividadEconomica } from '../../../features/actividades/models/actividad-economica.model';

@Injectable({ providedIn: 'root' })
export class ActividadEconomicaService {
  private readonly http = inject(HttpClient);
  private readonly urlApi = `${environment.apiUrl}/actividades-economicas`;

  listarTodas(): Observable<ActividadEconomica[]> {
    return this.http.get<ActividadEconomica[]>(this.urlApi);
  }

  listarFinancieras(): Observable<ActividadEconomica[]> {
    return this.http.get<ActividadEconomica[]>(`${this.urlApi}/financieras`);
  }
}
