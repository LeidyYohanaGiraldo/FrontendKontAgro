import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, timeout, TimeoutError } from 'rxjs';
import { AlertService } from '../../../shared/services/alert.service';
import { extraerMensajeBackend } from '../../utils/http-error.util';
import { SUPPRESS_GLOBAL_HTTP_ERROR } from './error-context';

/**
 * Centraliza los errores HTTP. Para respuestas del servidor, la prioridad es
 * siempre el mensaje enviado por Spring Boot. Las solicitudes técnicas que
 * gestionan su propio error pueden desactivar únicamente esta alerta global.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const alertService = inject(AlertService);
  const suprimirAlerta = req.context.get(SUPPRESS_GLOBAL_HTTP_ERROR);

  return next(req).pipe(
    timeout(15000),
    catchError((error: unknown) => {
      if (suprimirAlerta) {
        return throwError(() => error);
      }

      if (error instanceof TimeoutError) {
        alertService.error('El servidor tardó demasiado en responder.');
        return throwError(() => error);
      }

      if (error instanceof HttpErrorResponse) {
        if (error.status === 0) {
          alertService.error('No fue posible establecer conexión con el servidor.');
          return throwError(() => error);
        }

        const mensajeBackend = extraerMensajeBackend(error.error);
        alertService.error(
          mensajeBackend ?? 'El servidor no proporcionó un detalle para el error ocurrido.'
        );
        return throwError(() => error);
      }

      alertService.error('Ocurrió un error inesperado al procesar la respuesta.');
      return throwError(() => error);
    })
  );
};
