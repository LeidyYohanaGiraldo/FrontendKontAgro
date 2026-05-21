import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { Ingreso } from '../models/ingreso.model';

@Injectable({
  providedIn: 'root'
})
export class IngresoService {
  private http = inject(HttpClient);
  private readonly URL_API = `${environment.apiUrl}/ingreso`;

  listarTodos(page: number, size: number): Observable<any> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http.get<any>(
      `${this.URL_API}/ingresos`,
      { params }
    );
  }

  crear(ingreso: Ingreso): Observable<Ingreso> {
    return this.http.post<Ingreso>(this.URL_API, ingreso);
  }

  actualizar(ingreso: Ingreso): Observable<Ingreso> {
    return this.http.put<Ingreso>(this.URL_API, ingreso);
  }

  eliminar(id: number): Observable<void> {
    const params = new HttpParams().set('id', id);
    return this.http.delete<void>(this.URL_API, { params });
  }

  //Generar reporte Excel
  descargarReporte(f1: string, f2: string): Observable<Blob> {
    const params = new HttpParams().set('fechaInicial', f1)
      .set('fechaFinal', f2);
    return this.http.get(`${this.URL_API}/reporteExcel`, {
      params,
      responseType: 'blob'
    });
  }
}
