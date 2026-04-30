import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthResponseDTO, UsuarioDTO } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Esta es la URL del Backend en Spring Boot
  private apiUrl = 'http://localhost:8080/api/usuario';

  constructor(private http: HttpClient) { }

  // Método para el Login
  login(credenciales: UsuarioDTO): Observable<AuthResponseDTO> {
    return this.http.post<AuthResponseDTO>(`${this.apiUrl}/login`, credenciales);
  }

  // Método para el Registro
  registrar(usuario: UsuarioDTO): Observable<UsuarioDTO> {
    return this.http.post<UsuarioDTO>(this.apiUrl, usuario);
  }

}
