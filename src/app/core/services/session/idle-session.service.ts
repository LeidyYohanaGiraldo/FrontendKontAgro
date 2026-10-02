import { isPlatformBrowser } from '@angular/common';
import { DestroyRef, inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { fromEvent, interval, merge, Subscription, throttleTime } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AlertService } from '../../../shared/services/alert.service';
import { extraerMensajeBackend } from '../../utils/http-error.util';
import { AuthService } from '../auth/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class IdleSessionService {
  private readonly authService = inject(AuthService);
  private readonly alertService = inject(AlertService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  private readonly idleMs = environment.session.idleTimeoutMs;
  private readonly warningMs = environment.session.warningBeforeMs;
  private readonly refreshBeforeExpiryMs = environment.session.refreshBeforeExpiryMs;
  private readonly activityKey = 'kontagro:lastActivity';
  private readonly refreshRetryMs = 30_000;

  private subscription = new Subscription();
  private initialized = false;
  private warningShown = false;
  private refreshing = false;
  private nextRefreshAttemptAt = 0;

  start(): void {
    if (this.initialized || !isPlatformBrowser(this.platformId)) return;
    this.initialized = true;

    if (this.authService.getToken() && !localStorage.getItem(this.activityKey)) {
      this.markActivity();
    }

    const activity$ = merge(
      fromEvent(window, 'click'),
      fromEvent(window, 'keydown'),
      fromEvent(window, 'touchstart'),
      fromEvent(window, 'scroll'),
      fromEvent(window, 'mousemove')
    ).pipe(throttleTime(1000, undefined, { leading: true, trailing: true }));

    this.subscription.add(activity$.subscribe(() => this.handleActivity()));
    this.subscription.add(fromEvent(document, 'visibilitychange').subscribe(() => {
      if (!document.hidden) this.handleReturnToApp();
    }));
    this.subscription.add(fromEvent<StorageEvent>(window, 'storage').subscribe(event => this.handleStorage(event)));
    this.subscription.add(interval(15_000).subscribe(() => this.checkSession()));

    this.destroyRef.onDestroy(() => this.subscription.unsubscribe());
    this.checkSession();
  }

  private handleActivity(): void {
    if (!this.authService.getToken()) return;
    const last = this.lastActivity();
    if (last && Date.now() - last >= this.idleMs) {
      this.expireByInactivity();
      return;
    }
    this.markActivity();
    this.warningShown = false;
  }

  private handleReturnToApp(): void {
    if (!this.authService.getToken()) return;
    const last = this.lastActivity();
    if (last && Date.now() - last >= this.idleMs) {
      this.expireByInactivity();
      return;
    }
    this.markActivity();
    this.checkSession();
  }

  private checkSession(): void {
    if (!this.authService.getToken()) return;

    const last = this.lastActivity();
    if (!last) {
      this.markActivity();
      return;
    }

    const idle = Date.now() - last;
    if (idle >= this.idleMs) {
      this.expireByInactivity();
      return;
    }

    if (idle >= this.idleMs - this.warningMs && !this.warningShown) {
      this.warningShown = true;
      this.alertService.warning('La sesión se cerrará en aproximadamente 2 minutos si no registra actividad.');
    }

    const ahora = Date.now();
    if (
      !this.refreshing &&
      ahora >= this.nextRefreshAttemptAt &&
      idle < this.idleMs &&
      this.authService.tokenExpiraEn(this.refreshBeforeExpiryMs)
    ) {
      this.renovarSesion();
    }
  }

  private renovarSesion(): void {
    this.refreshing = true;
    this.authService.refreshAccessToken(true).subscribe({
      next: () => {
        this.refreshing = false;
        this.nextRefreshAttemptAt = 0;
      },
      error: (error: unknown) => {
        this.refreshing = false;

        if (this.authService.debeCerrarSesionPorErrorRefresh(error)) {
          const mensaje = error instanceof HttpErrorResponse
            ? extraerMensajeBackend(error.error)
            : null;
          this.alertService.warning(
            mensaje ?? 'La sesión ya no puede renovarse. Inicie sesión nuevamente.'
          );
          this.authService.cerrarSesionLocal(true);
          return;
        }

        // Un fallo temporal del servidor no equivale a inactividad ni invalida
        // automáticamente la sesión. Se reintentará mientras el usuario siga activo.
        this.nextRefreshAttemptAt = Date.now() + this.refreshRetryMs;
      }
    });
  }

  private expireByInactivity(): void {
    this.alertService.warning('La sesión se cerró por inactividad. Inicie sesión nuevamente para continuar.');
    this.authService.cerrarSesion();
  }

  private markActivity(): void {
    localStorage.setItem(this.activityKey, String(Date.now()));
  }

  private lastActivity(): number {
    return Number(localStorage.getItem(this.activityKey) ?? 0);
  }

  private handleStorage(event: StorageEvent): void {
    if (event.key === 'kontagro:logoutAt' && event.newValue) {
      this.authService.cerrarSesionLocal(false, false);
      this.router.navigate(['/login']);
    }
  }
}
