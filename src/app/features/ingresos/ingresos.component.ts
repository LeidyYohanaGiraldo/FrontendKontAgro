import { Component, inject, OnInit } from '@angular/core';
import { IngresoService } from './services/ingreso.service';
import { ActividadService } from '../actividades/services/actividad.service';
import { Ingreso } from './models/ingreso.model';
import { Actividad } from '../actividades/models/actividad.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalReporteExcelComponent } from '../../shared/components/modal-reporte-excel/modal-reporte-excel.component';

@Component({
  selector: 'app-ingresos',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalReporteExcelComponent],
  templateUrl: './ingresos.component.html',
  styleUrl: './ingresos.component.scss'
})
export class IngresosComponent implements OnInit {
  private _ingresoService = inject(IngresoService);
  private _actividadService = inject(ActividadService);

  public listaIngresos: Ingreso[] = [];
  public listaActividades: Actividad[] = [];

  public ingresoSeleccionado: Ingreso = this.initIngreso();
  public esEdicion = false;
  public mensajeExito: string = '';
  public mensajeError: string = '';
  public mostrarModalReporte = false;

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    // Cargamos ingresos
    // this._ingresoService.listarTodos().subscribe(data => this.listaIngresos = data);
    // Cargamos actividades para el select del formulario
    //this._actividadService.listarTodas().subscribe(data => this.listaActividades = data);
    this._ingresoService.listarTodos().subscribe(data => {
      console.log("INGRESOS:", data);
      this.listaIngresos = data;
    });

    this._actividadService.listarTodas().subscribe(data => {
      console.log("ACTIVIDADES:", data);
      this.listaActividades = data;
    });

  }

  initIngreso(): Ingreso {
    return {
      fecha: new Date().toISOString().split('T')[0], // Fecha de hoy por defecto
      valor: 0,
      idActividad: 0
    };
  }

  // El método guardar enviará el objeto tal cual lo espera el @RequestBody IngresoDTO
  guardar() {
    this.mensajeError = '';
    this.mensajeExito = '';

    // VALIDACIONES
    if (this.ingresoSeleccionado.idActividad === 0) {
      this.mensajeError = 'Debe seleccionar una actividad vinculada';
      return;
    }

    if (!this.ingresoSeleccionado.valor || this.ingresoSeleccionado.valor <= 0) {
      this.mensajeError = 'El monto debe ser mayor a 0';
      return;
    }

    if (!this.ingresoSeleccionado.fecha) {
      this.mensajeError = 'La fecha es obligatoria';
      return;
    }

    // Si pasa las validaciones, ejecutamos la petición
    const servicio = this.esEdicion
      ? this._ingresoService.actualizar(this.ingresoSeleccionado)
      : this._ingresoService.crear(this.ingresoSeleccionado);

    servicio.subscribe({
      next: () => {
        this.mensajeExito = this.esEdicion ? 'Ingreso actualizado con éxito' : 'Ingreso registrado con éxito';
        this.cargarDatos();
        this.limpiarFormulario();

        // Borrar mensaje de éxito tras 5 segundos
        setTimeout(() => this.mensajeExito = '', 5000);
      },
      error: (err) => {
        this.mensajeError = 'Error al procesar la solicitud en el servidor';
        console.error(err);
      }
    });
  }

  prepararEdicion(ingreso: Ingreso) {
    this.ingresoSeleccionado = { ...ingreso };
    this.esEdicion = true;
  }

  limpiarFormulario() {
    this.ingresoSeleccionado = this.initIngreso();
    this.esEdicion = false;
    this.mensajeError = '';
  }

  eliminar(id: number) {
    if (confirm('¿Eliminar este registro de ingreso?')) {
      this._ingresoService.eliminar(id).subscribe(() => this.cargarDatos());
    }
  }
  obtenerNombreActividad(idActividad: number): string {
    const actividad = this.listaActividades.find(
      a => a.idActividad == idActividad
    );
    return actividad ? actividad.nombreActividad : '';
  }
  abrirModalReporte() {
    this.mostrarModalReporte = true;
  }

  cerrarModalReporte() {
    this.mostrarModalReporte = false;
  }

  generarReporteExcel(event: any) {

    this._ingresoService
      .descargarReporte(event.fechaInicial, event.fechaFinal)
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'reporte_ingresos.xlsx';
          a.click();
          window.URL.revokeObjectURL(url);
          this.cerrarModalReporte();
        },

        error: (err) => {
          console.error(err);
        }
      });
  }
}
