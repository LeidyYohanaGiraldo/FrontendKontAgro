import { CommonModule, registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { Component, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { UiIconComponent } from '../ui-icon/ui-icon.component';
import { AuthService } from '../../../core/services/auth/auth.service';

registerLocaleData(localeEs);

@Component({
  selector: 'app-contenedor-principal',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, UiIconComponent],
  templateUrl: './contenedor-principal.component.html',
  styleUrl: './contenedor-principal.component.scss'
})
export class ContenedorPrincipalComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private relojId?: ReturnType<typeof setInterval>;

  fechaActual = new Date();
  menuMovilAbierto = false;

  ngOnInit(): void {
    this.relojId = setInterval(() => {
      this.fechaActual = new Date();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.relojId) {
      clearInterval(this.relojId);
    }
  }

  @HostListener('document:keydown.escape')
  cerrarMenuConEscape(): void {
    this.cerrarMenuMovil();
  }

  alternarMenuMovil(): void {
    this.menuMovilAbierto = !this.menuMovilAbierto;
  }

  cerrarMenuMovil(): void {
    this.menuMovilAbierto = false;
  }

  logout(): void {
    this.cerrarMenuMovil();
    this.authService.cerrarSesion();
  }
}
