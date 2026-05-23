import { Component, inject, OnInit } from '@angular/core';
import { IngresoService } from './services/ingreso.service';
import { ActividadService } from '../actividades/services/actividad.service';
import { Ingreso } from './models/ingreso.model';
import { Actividad } from '../actividades/models/actividad.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalReporteExcelComponent } from '../../shared/components/modal-reporte-excel/modal-reporte-excel.component';
import { AlertService } from '../../shared/services/alert.service';

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
  private alertService = inject(AlertService);

  public listaIngresos: Ingreso[] = [];
  public listaActividades: Actividad[] = [];

  public ingresoSeleccionado: Ingreso = this.initIngreso();
  public esEdicion = false;
  public mostrarModalReporte = false;
  public paginaActual: number = 0;
  public registrosPorPagina: number = 5;
  public totalPaginas: number = 0;
  public paginas: number[] = [];

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    // Cargamos ingresos
    // Cargamos actividades para el select del formulario

    this._ingresoService
      .listarTodos(this.paginaActual, this.registrosPorPagina)
      .subscribe(data => {

        console.log("INGRESOS:", data);
        this.listaIngresos = data.content;
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

  initIngreso(): Ingreso {
    return {
      fecha: new Date().toISOString().split('T')[0], // Fecha de hoy por defecto
      valor: 0,
      idActividad: 0
    };
  }

  // El método guardar enviará el objeto tal cual lo espera el @RequestBody IngresoDTO
  guardar() {
    // VALIDACIONES
    if (this.ingresoSeleccionado.idActividad === 0) {
      this.alertService.warning(
        'Debe seleccionar una actividad');
      return;
    }

    if (!this.ingresoSeleccionado.valor || this.ingresoSeleccionado.valor <= 0) {
      this.alertService.warning(
        'El monto debe ser mayor a 0'
      );

      return;
    }

    if (!this.ingresoSeleccionado.fecha) {
      this.alertService.warning(
        'La fecha es obligatoria'
      );
      return;
    }

    // Si pasa las validaciones, ejecutamos la petición
    const servicio = this.esEdicion
      ? this._ingresoService.actualizar(this.ingresoSeleccionado)
      : this._ingresoService.crear(this.ingresoSeleccionado);

    servicio.subscribe({
      next: () => {
        this.alertService.success(

          this.esEdicion
            ? 'Ingreso actualizado correctamente'
            : 'Ingreso registrado correctamente'
        );
        this.cargarDatos();
        this.limpiarFormulario();
      },
      error: (err) => {
        console.error(err);
        this.alertService.error(
          'Error al procesar la solicitud'
        );
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
  }

  eliminar(id: number) {
    if (confirm('¿Eliminar este registro de ingreso?')) {
      this._ingresoService
        .eliminar(id)
        .subscribe({
          next: () => {
            this.alertService.success(
              'Ingreso eliminado correctamente'
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
          this.alertService.success(
            'Reporte descargado correctamente'
          );
        },
        error: (err) => {
          console.error(err);
          this.alertService.error(
            'Error al descargar reporte'
          );
        }
      });
  }
}
