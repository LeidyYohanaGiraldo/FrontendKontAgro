import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-contenedor-principal',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './contenedor-principal.component.html',
  styleUrl: './contenedor-principal.component.scss'
})
export class ContenedorPrincipalComponent {
  
  public fechaActual: Date = new Date();

  constructor(private router: Router) { }

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
