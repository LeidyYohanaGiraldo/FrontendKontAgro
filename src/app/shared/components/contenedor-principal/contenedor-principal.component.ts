import { CommonModule, registerLocaleData } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import localeEs from '@angular/common/locales/es';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

registerLocaleData(localeEs);

@Component({
  selector: 'app-contenedor-principal',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './contenedor-principal.component.html',
  styleUrl: './contenedor-principal.component.scss'
})

export class ContenedorPrincipalComponent implements OnInit {
  
  private router = inject(Router);

  public fechaActual: Date = new Date();

  ngOnInit(): void {
    setInterval(() => {
      this.fechaActual = new Date();
    }, 1000);
  }

  logout(): void {
    console.log('Cerrando sesión en KontAgro...'); 
    this.router.navigate(['/login']);
  }

}
