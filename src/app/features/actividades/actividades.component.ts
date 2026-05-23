import { Component, inject, OnInit } from '@angular/core';
import { ActividadService } from './services/actividad.service';
import { Actividad } from './models/actividad.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../shared/services/alert.service';

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
  private alertService = inject(AlertService);

  // Variables para la vista
  public listaActividades: Actividad[] = [];
  public actividadSeleccionada: Actividad = { nombreActividad: '' };
  public esEdicion: boolean = false;
  public campoTocado: boolean = false;

  ngOnInit(): void {
    this.obtenerTodas();
  }

  obtenerTodas(): void {
  this._actividadService.listarTodas().subscribe({
    next: (data) => {
      this.listaActividades = data;
    },
    error: (err) => {
      console.error('Error al cargar actividades', err);
      this.alertService.error('Error al cargar actividades');
    }
  });
}

guardar(): void {
  this.campoTocado = true;
  const nombre = this.actividadSeleccionada?.nombreActividad?.trim();

  if(!nombre || nombre.length < 1) {
  this.alertService.warning(
    'El nombre es obligatorio'
  );
  return;
}

this.actividadSeleccionada.nombreActividad = nombre;

if (this.esEdicion) {
  this._actividadService.actualizar(this.actividadSeleccionada)
    .subscribe({
      next: () => {
        this.alertService.success(
          'Actividad actualizada correctamente'
        );
        this.limpiarFormulario();
        this.obtenerTodas();
      },
      error: () => {
        this.alertService.error(
          'Error al actualizar la actividad'
        );
      }
    });

} else {
  this._actividadService.crear(this.actividadSeleccionada).subscribe({
    next: () => {
      this.alertService.success(
        'Actividad creada exitosamente'
      );
      this.limpiarFormulario();
      this.obtenerTodas();
    },
    error: () => {
      this.alertService.error(
        'Error al crear la actividad'
      );
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
  if(confirm('¿Estás seguro de eliminar esta actividad?')) {
  this._actividadService.eliminar(id).subscribe({
    next: () => {
      this.alertService.success(
        'Actividad eliminada correctamente'
      );
      this.obtenerTodas();
    },
    error: () => {
      this.alertService.error(
        'No es posible eliminar la actividad porque tiene ingresos o egresos asociados'
      );
    }
  });
}
  }

limpiarFormulario(): void {
  this.actividadSeleccionada = { nombreActividad: '' };
  this.esEdicion = false;
  this.campoTocado = false;
}
}
