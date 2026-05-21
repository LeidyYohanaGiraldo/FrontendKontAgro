import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { Egreso } from '../models/egreso.model';

@Injectable({
  providedIn: 'root'
})
export class EgresoService {

private http = inject(HttpClient);
  private readonly URL_API = `${environment.apiUrl}/egreso`;

  listarTodos(page: number, size: number): Observable<any> {
  const params = new HttpParams()
    .set('page', page)
    .set('size', size);

  return this.http.get<any>(
    `${this.URL_API}/egresos`,
    { params }
  );
}

  crear(egreso: Egreso): Observable<Egreso> {
    return this.http.post<Egreso>(this.URL_API, egreso);
  }

  actualizar(egreso: Egreso): Observable<Egreso> {
    return this.http.put<Egreso>(this.URL_API, egreso);
  }

  eliminar(id: number): Observable<void> {
    const params = new HttpParams().set('id', id);
    return this.http.delete<void>(this.URL_API, { params });
  }

  //Generar reporte Excel
  descargarReporte(f1: string, f2: string): Observable<Blob> {
    const params = new HttpParams().set('fechaInicial', f1).set('fechaFinal', f2);
    return this.http.get(`${this.URL_API}/reporteExcel`, {
      params,
      responseType: 'blob'
    });
  }
}
