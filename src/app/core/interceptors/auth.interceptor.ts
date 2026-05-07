import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  //  Obtener el token del almacenamiento 
  const token = localStorage.getItem('token');

  // Si existe el token, se clona la petición y se añade en la cabecera
  let cloned = req;
  if (token) {
    cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  return next(cloned).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el status es 401, significa que el token ya no sirve
      if (error.status === 401 || error.status === 403) {
        console.warn('Sesión expirada o token inválido. Redirigiendo...');

        // Se limpia el token viejo para que no intente usarlo de nuevo
        localStorage.removeItem('token');

        // Se redirige el usuario al login
        router.navigate(['/login']);
      }
      // Se propaga el error para que el componente también sepa que falló
      return throwError(() => error);
    })
  );
};
