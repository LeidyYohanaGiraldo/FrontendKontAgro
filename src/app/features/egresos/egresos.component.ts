import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaginacionComponent } from '../../shared/components/paginacion/paginacion.component';
import { UiIconComponent } from '../../shared/components/ui-icon/ui-icon.component';
import { DocumentosSoporteComponent } from '../../shared/components/documentos-soporte/documentos-soporte.component';
import { AlertService } from '../../shared/services/alert.service';
import { Actividad, TipoMovimiento } from '../actividades/models/actividad.model';
import { ActividadService } from '../actividades/services/actividad.service';
import { Egreso, EgresoForm } from './models/egreso.model';
import { EgresoService } from './services/egreso.service';

@Component({
  selector: 'app-egresos',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginacionComponent, UiIconComponent, DocumentosSoporteComponent],
  templateUrl: './egresos.component.html',
  styleUrl: './egresos.component.scss'
})
export class EgresosComponent implements OnInit {
  private readonly egresoService = inject(EgresoService);
  private readonly actividadService = inject(ActividadService);
  private readonly alertService = inject(AlertService);

  listaEgresos: Egreso[] = [];
  listaActividades: Actividad[] = [];
  egresoSeleccionado: EgresoForm = this.inicializarEgreso();
  esEdicion = false;
  paginaActual = 0;
  readonly registrosPorPagina = 5;
  totalPaginas = 0;
  totalRegistros = 0;
  idMovimientoSoportes: number | null = null;

  ngOnInit(): void {
    this.cargarEgresos();
    this.cargarActividades();
  }

  cargarEgresos(): void {
    this.egresoService.listarTodos(this.paginaActual, this.registrosPorPagina).subscribe({
      next: (page) => {
        this.listaEgresos = page.content;
        this.totalPaginas = page.totalPages;
        this.totalRegistros = page.totalElements;
        this.paginaActual = page.number;
      }
    });
  }

  cargarActividades(): void {
    this.actividadService.listarCombo(TipoMovimiento.EGRESO).subscribe({
      next: (actividades) => this.listaActividades = actividades,
      error: () => this.listaActividades = []
    });
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 0 && pagina < this.totalPaginas) {
      this.paginaActual = pagina;
      this.cargarEgresos();
    }
  }

  guardar(): void {
    const egreso = this.construirEgreso();
    if (!egreso) {
      return;
    }

    const request$ = this.esEdicion
      ? this.egresoService.actualizar(egreso)
      : this.egresoService.crear(egreso);

    request$.subscribe({
      next: () => {
        this.alertService.success(
          this.esEdicion ? 'Egreso actualizado correctamente' : 'Egreso registrado exitosamente'
        );
        this.limpiarFormulario();
        this.cargarEgresos();
      }
    });
  }

  prepararEdicion(egreso: Egreso): void {
    this.egresoSeleccionado = {
      id: egreso.id,
      idActividad: egreso.idActividad,
      fecha: egreso.fecha,
      valor: egreso.valor
    };
    this.esEdicion = true;
  }

  limpiarFormulario(): void {
    this.egresoSeleccionado = this.inicializarEgreso();
    this.esEdicion = false;
  }

  eliminar(id: number): void {
    if (!window.confirm('¿Eliminar este registro de egreso?')) {
      return;
    }

    this.egresoService.eliminar(id).subscribe({
      next: () => {
        this.alertService.success('Egreso eliminado correctamente');
        this.cargarEgresos();
      }
    });
  }

  obtenerNombreActividad(egreso: Egreso): string {
    if (egreso.nombreActividad) {
      return egreso.nombreActividad;
    }
    return this.listaActividades.find(
      actividad => actividad.idActividad === egreso.idActividad
    )?.nombreActividad ?? `Actividad #${egreso.idActividad}`;
  }

  alternarSoportes(id: number): void {
    this.idMovimientoSoportes = this.idMovimientoSoportes === id ? null : id;
  }

  private inicializarEgreso(): EgresoForm {
    return {
      idActividad: null,
      fecha: new Date().toISOString().split('T')[0],
      valor: null
    };
  }

  private construirEgreso(): Egreso | null {
    const { id, idActividad, fecha, valor } = this.egresoSeleccionado;

    if (!idActividad) {
      this.alertService.warning('Debe seleccionar una actividad asociada a egresos');
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
