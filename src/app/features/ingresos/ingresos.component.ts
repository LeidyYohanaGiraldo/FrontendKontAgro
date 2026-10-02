import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalReporteExcelComponent } from '../../shared/components/modal-reporte-excel/modal-reporte-excel.component';
import { PaginacionComponent } from '../../shared/components/paginacion/paginacion.component';
import { UiIconComponent } from '../../shared/components/ui-icon/ui-icon.component';
import { DocumentosSoporteComponent } from '../../shared/components/documentos-soporte/documentos-soporte.component';
import { AlertService } from '../../shared/services/alert.service';
import { Actividad, TipoMovimiento } from '../actividades/models/actividad.model';
import { ActividadService } from '../actividades/services/actividad.service';
import { Ingreso, IngresoForm } from './models/ingreso.model';
import { IngresoService } from './services/ingreso.service';

@Component({
  selector: 'app-ingresos',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalReporteExcelComponent, PaginacionComponent, UiIconComponent, DocumentosSoporteComponent],
  templateUrl: './ingresos.component.html',
  styleUrl: './ingresos.component.scss'
})
export class IngresosComponent implements OnInit {
  private readonly ingresoService = inject(IngresoService);
  private readonly actividadService = inject(ActividadService);
  private readonly alertService = inject(AlertService);

  listaIngresos: Ingreso[] = [];
  listaActividades: Actividad[] = [];
  ingresoSeleccionado: IngresoForm = this.inicializarIngreso();
  esEdicion = false;
  mostrarModalReporte = false;
  paginaActual = 0;
  readonly registrosPorPagina = 5;
  totalPaginas = 0;
  totalRegistros = 0;
  idMovimientoSoportes: number | null = null;

  ngOnInit(): void {
    this.cargarIngresos();
    this.cargarActividades();
  }

  cargarIngresos(): void {
    this.ingresoService.listarTodos(this.paginaActual, this.registrosPorPagina).subscribe({
      next: (page) => {
        this.listaIngresos = page.content;
        this.totalPaginas = page.totalPages;
        this.totalRegistros = page.totalElements;
        this.paginaActual = page.number;
      }
    });
  }

  cargarActividades(): void {
    this.actividadService.listarCombo(TipoMovimiento.INGRESO).subscribe({
      next: (actividades) => this.listaActividades = actividades,
      error: () => this.listaActividades = []
    });
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 0 && pagina < this.totalPaginas) {
      this.paginaActual = pagina;
      this.cargarIngresos();
    }
  }

  guardar(): void {
    const ingreso = this.construirIngreso();
    if (!ingreso) {
      return;
    }

    const request$ = this.esEdicion
      ? this.ingresoService.actualizar(ingreso)
      : this.ingresoService.crear(ingreso);

    request$.subscribe({
      next: () => {
        this.alertService.success(
          this.esEdicion ? 'Ingreso actualizado correctamente' : 'Ingreso registrado correctamente'
        );
        this.limpiarFormulario();
        this.cargarIngresos();
      }
    });
  }

  prepararEdicion(ingreso: Ingreso): void {
    this.ingresoSeleccionado = {
      id: ingreso.id,
      idActividad: ingreso.idActividad,
      fecha: ingreso.fecha,
      valor: ingreso.valor
    };
    this.esEdicion = true;
  }

  limpiarFormulario(): void {
    this.ingresoSeleccionado = this.inicializarIngreso();
    this.esEdicion = false;
  }

  eliminar(id: number): void {
    if (!window.confirm('¿Eliminar este registro de ingreso?')) {
      return;
    }

    this.ingresoService.eliminar(id).subscribe({
      next: () => {
        this.alertService.success('Ingreso eliminado correctamente');
        this.cargarIngresos();
      }
    });
  }

  obtenerNombreActividad(ingreso: Ingreso): string {
    if (ingreso.nombreActividad) {
      return ingreso.nombreActividad;
    }
    return this.listaActividades.find(
      actividad => actividad.idActividad === ingreso.idActividad
    )?.nombreActividad ?? `Actividad #${ingreso.idActividad}`;
  }

  abrirModalReporte(): void {
    this.mostrarModalReporte = true;
  }

  cerrarModalReporte(): void {
    this.mostrarModalReporte = false;
  }

  generarReporteExcel(event: { fechaInicial: string; fechaFinal: string }): void {
    this.ingresoService.descargarReporte(event.fechaInicial, event.fechaFinal).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = 'reporte_ingresos.xlsx';
        enlace.click();
        window.URL.revokeObjectURL(url);
        this.cerrarModalReporte();
        this.alertService.success('Reporte descargado correctamente');
      },
      error: () => this.alertService.error('Error al descargar reporte')
    });
  }

  alternarSoportes(id: number): void {
    this.idMovimientoSoportes = this.idMovimientoSoportes === id ? null : id;
  }

  private inicializarIngreso(): IngresoForm {
    return {
      idActividad: null,
      fecha: new Date().toISOString().split('T')[0],
      valor: null
    };
  }

  private construirIngreso(): Ingreso | null {
    const { id, idActividad, fecha, valor } = this.ingresoSeleccionado;

    if (!idActividad) {
      this.alertService.warning('Debe seleccionar una actividad asociada a ingresos');
      return null;
    }
    if (valor == null || !Number.isFinite(Number(valor)) || Number(valor) <= 0) {
      this.alertService.warning('El monto debe ser mayor a cero');
      return null;
    }
    if (!fecha) {
      this.alertService.warning('La fecha es obligatoria');
      return null;
    }

    return { id, idActividad, fecha, valor: Number(valor) };
  }
}
