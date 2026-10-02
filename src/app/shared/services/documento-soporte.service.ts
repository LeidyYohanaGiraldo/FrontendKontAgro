import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DocumentoSoporte, DocumentoSoporteForm } from '../models/documento-soporte.model';

@Injectable({ providedIn: 'root' })
export class DocumentoSoporteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/documentos-soporte`;

  listar(origen: 'INGRESO' | 'EGRESO', idMovimiento: number): Observable<DocumentoSoporte[]> {
    return this.http.get<DocumentoSoporte[]>(`${this.apiUrl}/${origen.toLowerCase()}/${idMovimiento}`);
  }

  cargar(origen: 'INGRESO' | 'EGRESO', idMovimiento: number, datos: DocumentoSoporteForm, archivo: File): Observable<DocumentoSoporte> {
    let params = new HttpParams().set('tipoDocumento', datos.tipoDocumento);
    if (datos.numeroDocumento.trim()) params = params.set('numeroDocumento', datos.numeroDocumento.trim());
    if (datos.fechaDocumento) params = params.set('fechaDocumento', datos.fechaDocumento);
    if (datos.nombreTercero.trim()) params = params.set('nombreTercero', datos.nombreTercero.trim());
    if (datos.identificacionTercero.trim()) params = params.set('identificacionTercero', datos.identificacionTercero.trim());

    const formData = new FormData();
    formData.append('archivo', archivo);
    return this.http.post<DocumentoSoporte>(
      `${this.apiUrl}/${origen.toLowerCase()}/${idMovimiento}`,
      formData,
      { params }
    );
  }

  descargar(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/archivo`, { responseType: 'blob' });
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
