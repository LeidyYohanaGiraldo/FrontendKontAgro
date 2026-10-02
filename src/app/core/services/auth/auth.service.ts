import { HttpClient, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, map, Observable, of, shareReplay, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SUPPRESS_GLOBAL_HTTP_ERROR } from '../../interceptors/error/error-context';
import { AuthResponseDTO, UsuarioDTO } from '../../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = `${environment.apiUrl}/usuario`;
  private refreshRequest$: Observable<AuthResponseDTO> | null = null;

  login(credenciales: UsuarioDTO): Observable<AuthResponseDTO> {
    return this.http.post<AuthResponseDTO>(`${this.apiUrl}/login`, credenciales, { withCredentials: true })
      .pipe(tap(respuesta => this.guardarSesion(respuesta)));
  }

  registrar(usuario: UsuarioDTO): Observable<UsuarioDTO> {
    return this.http.post<UsuarioDTO>(this.apiUrl, usuario, { withCredentials: true });
  }

  refreshAccessToken(silencioso = false): Observable<AuthResponseDTO> {
    if (this.refreshRequest$) return this.refreshRequest$;

    const context = silencioso
      ? new HttpContext().set(SUPPRESS_GLOBAL_HTTP_ERROR, true)
      : undefined;

    this.refreshRequest$ = this.http.post<AuthResponseDTO>(
      `${this.apiUrl}/refresh`,
      {},
      { withCredentials: true, ...(context ? { context } : {}) }
    ).pipe(
      tap(respuesta => this.guardarSesion(respuesta)),
      finalize(() => this.refreshRequest$ = null),
      shareReplay(1)
    );
    return this.refreshRequest$;
  }

  cerrarSesion(redirigir = true): void {
    const context = new HttpContext().set(SUPPRESS_GLOBAL_HTTP_ERROR, true);
    this.http.post<void>(`${this.apiUrl}/logout`, {}, { withCredentials: true, context })
      .pipe(catchError(() => of(void 0)))
      .subscribe({ complete: () => this.limpiarSesion(redirigir) });
  }

  cerrarSesionLocal(redirigir = true, broadcast = true): void {
    this.limpiarSesion(redirigir, broadcast);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  tieneSesionLocal(): boolean {
    return !!this.getToken() && !!localStorage.getItem('usuario');
  }

  estaAutenticado(): boolean {
    const token = this.getToken();
    if (!token) return false;
    const exp = this.obtenerExpiracionToken(token);
    return exp != null && exp > Date.now();
  }

  tokenExpiraEn(milisegundos: number): boolean {
    const token = this.getToken();
    if (!token) return true;
    const exp = this.obtenerExpiracionToken(token);
    return exp == null || exp - Date.now() <= milisegundos;
  }

  debeCerrarSesionPorErrorRefresh(error: unknown): boolean {
    return error instanceof HttpErrorResponse && error.status === 401;
  }

  asegurarSesion(): Observable<boolean> {
    if (this.estaAutenticado()) return of(true);

    return this.refreshAccessToken(true).pipe(
      map(() => true),
      catchError(error => {
        if (this.debeCerrarSesionPorErrorRefresh(error)) {
          this.limpiarSesion(false);
        }
        return throwError(() => error);
      })
    );
  }

  private guardarSesion(respuesta: AuthResponseDTO): void {
    localStorage.setItem('token', respuesta.token);
    localStorage.setItem('usuario', JSON.stringify(respuesta.usuario));
    localStorage.setItem('tokenExpiresAt', String(respuesta.tokenExpiresAt));

    if (!localStorage.getItem('kontagro:lastActivity')) {
      localStorage.setItem('kontagro:lastActivity', String(Date.now()));
    }
  }

  private limpiarSesion(redirigir: boolean, broadcast = true): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('tokenExpiresAt');
    localStorage.removeItem('kontagro:lastActivity');
    if (broadcast) localStorage.setItem('kontagro:logoutAt', String(Date.now()));
    if (redirigir) this.router.navigate(['/login']);
  }

  private obtenerExpiracionToken(token: string): number | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
    } catch {
      return null;
    }
  }
}
