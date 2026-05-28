import { Component, inject, OnInit } from '@angular/core';
import { ActividadService } from './services/actividad.service';
import { Actividad } from './models/actividad.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../shared/services/alert.service';
import { ActividadEconomicaService } from '../../core/services/actividad-economica/actividad-economica.service';
import { ActividadEconomica } from '../../core/models/actividad-economica.model';

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
  private actividadEconomicaService = inject(ActividadEconomicaService);

  // Variables para la vista
  public listaActividades: Actividad[] = [];

  public actividadSeleccionada: Actividad = {
    nombreActividad: '',
    idActividadEconomica: undefined
  };
  public esEdicion: boolean = false;
  public campoTocado: boolean = false;

  //Lista para el combobox
  public listaActividadesEconomicas: ActividadEconomica[] = [];

  get nombreActividadInvalido(): boolean {
    return !this.actividadSeleccionada.nombreActividad?.trim();
  }

  get actividadEconomicaInvalida(): boolean {
    return !this.actividadSeleccionada.idActividadEconomica;
  }

  ngOnInit(): void {
    this.obtenerTodas();
    this.obtenerActividadesEconomicas();
  }

  obtenerTodas(): void {
    this._actividadService.listarTodas().subscribe({
      next: (data) => {
        this.listaActividades = data;
      },
    });
  }
  obtenerActividadesEconomicas(): void {
    this.actividadEconomicaService.listarTodas().subscribe({
      next: (data) => {

        console.log('DATA COMBO:', data);
        this.listaActividadesEconomicas = data;
      },
    error: (err) => {
      console.error('ERROR COMBO:', err);
    }
    });
  }

  guardar(): void {
    this.campoTocado = true;

    if (this.nombreActividadInvalido) {
      this.alertService.warning('El nombre es obligatorio');
      return;
    }

    if (this.actividadEconomicaInvalida) {
      this.alertService.warning('Debe seleccionar una actividad económica');
      return;
    }

    const request$ = this.esEdicion
      ? this._actividadService.actualizar(this.actividadSeleccionada)
      : this._actividadService.crear(this.actividadSeleccionada);

    request$.subscribe({
      next: () => {

        const mensaje = this.esEdicion
          ? 'Actividad actualizada correctamente'
          : 'Actividad creada exitosamente';

        this.alertService.success(mensaje);

        this.limpiarFormulario();
        this.obtenerTodas();
      }
    });
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
      this._actividadService.eliminar(id).subscribe({
        next: () => {
          this.alertService.success(
            'Actividad eliminada correctamente'
          );
          this.obtenerTodas();
        },
      });
    }
  }

  limpiarFormulario(): void {
    this.actividadSeleccionada = {
      nombreActividad: '',
      idActividadEconomica: undefined
    };

    this.esEdicion = false;
    this.campoTocado = false;
  }
}
