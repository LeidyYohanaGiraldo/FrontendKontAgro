import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Page } from '../../../shared/models/page.model';
import { Actividad, TipoMovimiento, TipoMovimientoOpcion } from '../models/actividad.model';

@Injectable({
  providedIn: 'root'
})
export class ActividadService {
  private readonly http = inject(HttpClient);
  private readonly urlApi = `${environment.apiUrl}/actividad`;

  listarTodas(page: number, size: number): Observable<Page<Actividad>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http.get<Page<Actividad>>(`${this.urlApi}/actividades`, { params });
  }

  listarCombo(tipoMovimiento?: TipoMovimiento): Observable<Actividad[]> {
    const params = tipoMovimiento
      ? new HttpParams().set('tipoMovimiento', tipoMovimiento)
      : undefined;

    return this.http.get<Actividad[]>(`${this.urlApi}/combo`, { params });
  }

  listarTiposMovimiento(): Observable<TipoMovimientoOpcion[]> {
    return this.http.get<TipoMovimientoOpcion[]>(`${this.urlApi}/tipos-movimiento`);
  }

  consultarPorId(id: number): Observable<Actividad> {
    const params = new HttpParams().set('id', id);
    return this.http.get<Actividad>(this.urlApi, { params });
  }

  crear(actividad: Actividad): Observable<Actividad> {
    return this.http.post<Actividad>(`${this.urlApi}/crear`, actividad);
  }

  actualizar(actividad: Actividad): Observable<Actividad> {
    return this.http.put<Actividad>(this.urlApi, actividad);
  }

  eliminar(id: number): Observable<void> {
    const params = new HttpParams().set('id', id);
    return this.http.delete<void>(this.urlApi, { params });
  }
}
