import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (authService.estaAutenticado()) return true;

  return authService.asegurarSesion().pipe(
    map(() => true),
    catchError(error => {
      if (authService.debeCerrarSesionPorErrorRefresh(error) || !authService.tieneSesionLocal()) {
        router.navigate(['/login']);
        return of(false);
      }

      // Si el servidor tiene un problema temporal de renovación, se conserva la
      // interfaz local. La API sigue protegida y la renovación se reintentará.
      return of(true);
    })
  );
};
