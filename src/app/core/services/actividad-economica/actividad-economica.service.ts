import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { Observable } from "rxjs";
import { ActividadEconomica } from "../../models/actividad-economica.model";


@Injectable({  
    providedIn: 'root' 
})
export class ActividadEconomicaService {
  private http = inject(HttpClient);
  private readonly URL_API = `${environment.apiUrl}/actividades-economicas`;

  listarTodas(): Observable<ActividadEconomica[]> {
    return this.http.get<ActividadEconomica[]>(this.URL_API);
  }
} 