import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();
  const esEndpointSesion = /\/usuario\/(login|refresh|logout)$/.test(req.url);

  const request = req.clone({
    withCredentials: true,
    ...(token && !esEndpointSesion ? { setHeaders: { Authorization: `Bearer ${token}` } } : {})
  });

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !esEndpointSesion) {
        return authService.refreshAccessToken(true).pipe(
          switchMap(() => {
            const nuevoToken = authService.getToken();
            if (!nuevoToken) return throwError(() => error);

            return next(req.clone({
              withCredentials: true,
              setHeaders: { Authorization: `Bearer ${nuevoToken}` }
            }));
          }),
          catchError(refreshError => {
            if (authService.debeCerrarSesionPorErrorRefresh(refreshError)) {
              authService.cerrarSesionLocal(false);
              router.navigate(['/login']);
            }
            // Los errores técnicos de renovación no invalidan por sí solos la sesión.
            return throwError(() => refreshError);
          })
        );
      }

      // Un 403 representa falta de autorización para la operación; no invalida la sesión.
      return throwError(() => error);
    })
  );
};
