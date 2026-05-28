import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AlertService } from '../../../shared/services/alert.service';
import { catchError, throwError, timeout, TimeoutError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {

  const alertService = inject(AlertService);

  return next(req).pipe(

    timeout(15000),
    catchError((error: unknown) => {

      let mensaje = 'Ocurrió un error inesperado, comuniquese con el administrador';

      // Timeout
      if (error instanceof TimeoutError) {
        mensaje = 'El servidor tardó demasiado en responder';
        alertService.error(mensaje);
        return throwError(() => error);
      }

      // HTTP ERRORS
      if (error instanceof HttpErrorResponse) {

        const backendMessage = error?.error?.message?.trim();
        const backendErrors = error?.error?.errors;

        // Sin conexión
        if (error.status === 0) {
          mensaje = 'No hay conexión con el servidor';
        }

        // 401
        else if (error.status === 401) {
          mensaje = backendMessage || 'No autorizado';
        }

        // 403
        else if (error.status === 403) {
          mensaje = backendMessage || 'No tienes permisos';
        }

        //  400 / 404
        else if (error.status === 400 || error.status === 404) {
          mensaje = backendMessage || 'Solicitud inválida o no encontrada';
        }

        // 500+
        else if (error.status >= 500) {
          mensaje = backendMessage || 'Error interno del servidor';
        }

        //  VALIDACIONES (solo si existen)
        if (backendErrors && typeof backendErrors === 'object') {
          const erroresPlano = Object.values(backendErrors)
            .flat()
            .filter(Boolean)
            .join(' | ');

          if (erroresPlano) {
            mensaje = erroresPlano;
          }
        }
        alertService.error(mensaje);
        return throwError(() => error);
      }
      alertService.error(mensaje);
      return throwError(() => error);
    })
  );
};
