import { Component, inject, OnInit } from '@angular/core';
import { EgresoService } from './services/egreso.service';
import { ActividadService } from '../actividades/services/actividad.service';
import { Egreso } from './models/egreso.model';
import { Actividad } from '../actividades/models/actividad.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../shared/services/alert.service';

@Component({
  selector: 'app-egresos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './egresos.component.html',
  styleUrl: './egresos.component.scss'
})
export class EgresosComponent implements OnInit {
  private _egresoService = inject(EgresoService);
  private _actividadService = inject(ActividadService);
  private alertService = inject(AlertService);

  public listaEgresos: Egreso[] = [];
  public listaActividades: Actividad[] = [];

  public egresoSeleccionado: Egreso = this.initIngreso();
  public esEdicion = false;
  public paginaActual: number = 0;
  public registrosPorPagina: number = 5;
  public totalPaginas: number = 0;
  public paginas: number[] = [];

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    // Cargamos egresos

    this._egresoService
      .listarTodos(this.paginaActual, this.registrosPorPagina).subscribe(data => {
        console.log("EGRESOS:", data);
        this.listaEgresos = data.content;
        this.totalPaginas = data.totalPages;
        this.generarPaginas();
      });

    this._actividadService.listarTodas().subscribe(data => {
      console.log("ACTIVIDADES:", data);
      this.listaActividades = data;
    });
  }

  generarPaginas(): void {
    this.paginas = Array.from(
      { length: this.totalPaginas },
      (_, i) => i
    );
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 0 && pagina < this.totalPaginas) {
      this.paginaActual = pagina;
      this.cargarDatos();
    }
  }

  initIngreso(): Egreso {
    return {
      fecha: new Date().toISOString().split('T')[0], // Fecha de hoy por defecto
      valor: 0,
      idActividad: 0
    };
  }

  // El método guardar enviará el objeto tal cual lo espera el @RequestBody EgresoDTO
  guardar() {
    // Validaciones antes de enviar
    if (this.egresoSeleccionado.idActividad === 0) {
      this.alertService.warning(
        'Debe seleccionar una actividad');
      return;
    }

    if (!this.egresoSeleccionado.valor || this.egresoSeleccionado.valor <= 0) {
      this.alertService.warning(
        'El monto debe ser mayor a 0'
      );
      return;
    }

    if (!this.egresoSeleccionado.fecha) {
      this.alertService.warning(
        'La fecha es obligatoria'
      );
      return;
    }

    // Si pasa las validaciones, procedemos
    const servicio = this.esEdicion
      ? this._egresoService.actualizar(this.egresoSeleccionado)
      : this._egresoService.crear(this.egresoSeleccionado);

    servicio.subscribe({
      next: () => {
        this.alertService.success(
          this.esEdicion 
          ? 'Egreso actualizado correctamente' 
          : 'Egreso registrado exitosamente'
        );  
        this.cargarDatos();
        this.limpiarFormulario();
      },
      error: (err) => {
        console.error(err);
        
      }
    });
  }

  prepararEdicion(egreso: Egreso) {
    this.egresoSeleccionado = { ...egreso };
    this.esEdicion = true;
  }

  limpiarFormulario() {
    this.egresoSeleccionado = this.initIngreso();
    this.esEdicion = false;
  }

  eliminar(id: number) {
    if (confirm('¿Eliminar este registro de egreso?')) {
      this._egresoService.eliminar(id).subscribe({
          next: () => {
            this.alertService.success(
              'Egreso eliminado correctamente'
            );
            this.cargarDatos();
          },
          error: () => {
            this.alertService.error(
              'No fue posible eliminar el ingreso'
            );
          }
        });
    }
  }
  obtenerNombreActividad(idActividad: number): string {
    const actividad = this.listaActividades.find(
      a => a.idActividad == idActividad
    );
    return actividad ? actividad.nombreActividad : '';
  }
}
