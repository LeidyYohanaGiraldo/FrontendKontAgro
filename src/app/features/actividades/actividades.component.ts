import { Component, inject, OnInit } from '@angular/core';
import { ActividadService } from './services/actividad.service';
import { Actividad } from './models/actividad.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-actividades',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './actividades.component.html',
  styleUrl: './actividades.component.scss'
})
export class ActividadesComponent implements OnInit {
  // Inyectamos el servicio que creamos con la URL global
  private _actividadService = inject(ActividadService);

  // Variables para la vista
  public listaActividades: Actividad[] = [];
  public actividadSeleccionada: Actividad = { nombreActividad: '' };
  public esEdicion: boolean = false;
  public campoTocado: boolean = false;
  public mensajeExito: string = '';
  public mensajeError: string = '';

  ngOnInit(): void {
    this.obtenerTodas();
  }

  obtenerTodas(): void {
    this._actividadService.listarTodas().subscribe({
      next: (data) => this.listaActividades = data,
      error: (err) => console.error('Error al cargar actividades', err)
    });
  }

  guardar(): void {
    this.mensajeExito = '';
    this.mensajeError = '';
    this.campoTocado = true;
    const nombre = this.actividadSeleccionada.nombreActividad?.trim();

    if (!nombre || nombre.length < 1) {
      this.mensajeError = 'El nombre es obligatorio';
      this.mensajeExito = '';
      return;
    }
    this.mensajeError = '';
    this.actividadSeleccionada.nombreActividad = nombre;

    if (this.esEdicion) {
      this._actividadService.actualizar(this.actividadSeleccionada)
        .subscribe({
          next: () => {
            this.mensajeExito = 'Actividad actualizada correctamente';
            this.limpiarFormulario();
            this.obtenerTodas();
          },
          error: () => {
            this.mensajeError = 'Error al actualizar la actividad';
          }
        });

    } else {
      this._actividadService.crear(this.actividadSeleccionada).subscribe({
        next: () => {
          this.mensajeExito = 'Actividad creada exitosamente';
          this.limpiarFormulario();
          this.obtenerTodas();
        },
        error: () => {
          this.mensajeError = 'Error al crear la actividad';
        }
      });
    }
  }

  prepararEdicion(actividad: Actividad): void {
    // Usamos el operador spread (...) para crear una copia del objeto.
    // Así, si el usuario escribe en el input pero luego cancela, 
    // los datos originales de la tabla no se habrán modificado.
    this.actividadSeleccionada = { ...actividad };
    this.esEdicion = true;

  }

  eliminar(id: number): void {
    if (confirm('¿Estás seguro de eliminar esta actividad?')) {
      this._actividadService.eliminar(id).subscribe(() => this.obtenerTodas());
    }
  }

  limpiarFormulario(): void {
    this.actividadSeleccionada = { nombreActividad: '' };
    this.esEdicion = false;
    this.campoTocado = false;
    this.mensajeError = '';

    setTimeout(() => {
      this.mensajeExito = '';
    }, 6000);
  }
}
