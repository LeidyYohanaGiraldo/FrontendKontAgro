import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token'); 

  if (token) {
    return true; // Si Hay token, permitir el acceso
  } else {
    // Si no hay token, redirigir al login
    router.navigate(['/login']);
    return false;
  }
};