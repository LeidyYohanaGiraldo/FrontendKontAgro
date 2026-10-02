/// <reference types="@angular/core" />

import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { AuthService } from '../../../core/services/auth/auth.service';
import { UsuarioDTO } from '../../../core/models/usuario.model';
import { Router } from '@angular/router'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  credenciales: UsuarioDTO = {
    usuario: '',
    contrasena: ''

  };
  
  onLogin(): void {
    this.authService.login(this.credenciales).subscribe({
      next: () => this.router.navigate(['/menu']),
      error: () => { /* El interceptor global muestra el mensaje enviado por el backend. */ }
    });
  }
}


