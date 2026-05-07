/// <reference types="@angular/core" />

import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { AuthService } from '../../../core/services/auth.service';
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
  
  onLogin() {
    this.authService.login(this.credenciales).subscribe({
      next: (response) => {
        console.log('¡Bienvenido!', response);
        // Se guarda el token que generó Java en el navegador
        localStorage.setItem('token', response.token);

        this.router.navigate(['/menu']);
        //alert('Login exitoso');
      },
      error: (err) => {
        console.error('Error en el login', err);
        alert('Usuario o contraseña incorrectos');
      }
    });
  }


}


