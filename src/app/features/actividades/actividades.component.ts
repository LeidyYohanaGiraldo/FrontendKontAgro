import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaginacionComponent } from '../../shared/components/paginacion/paginacion.component';
import { TextoTruncadoComponent } from '../../shared/components/texto-truncado/texto-truncado.component';
import { UiIconComponent } from '../../shared/components/ui-icon/ui-icon.component';
import { AlertService } from '../../shared/services/alert.service';
import { Actividad, TipoMovimiento, TipoMovimientoOpcion } from './models/actividad.model';
import { ActividadService } from './services/actividad.service';

@Component({
  selector: 'app-actividades',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginacionComponent, UiIconComponent, TextoTruncadoComponent],
  templateUrl: './actividades.component.html',
  styleUrl: './actividades.component.scss'
})
export class ActividadesComponent implements OnInit {
  private readonly actividadService = inject(ActividadService);
  private readonly alertService = inject(AlertService);

  readonly TipoMovimiento = TipoMovimiento;

  listaActividades: Actividad[] = [];
  tiposMovimiento: TipoMovimientoOpcion[] = [];
  actividadSeleccionada: Actividad = this.inicializarActividad();
  esEdicion = false;
  campoTocado = false;
  paginaActual = 0;
  readonly registrosPorPagina = 5;
  totalPaginas = 0;
  totalRegistros = 0;

  get nombreActividadInvalido(): boolean {
    return !this.actividadSeleccionada.nombreActividad?.trim();
  }

  get tipoMovimientoInvalido(): boolean {
    return !this.actividadSeleccionada.tipoMovimiento;
  }

  ngOnInit(): void {
    this.obtenerTodas();
    this.obtenerTiposMovimiento();
  }

  obtenerTodas(): void {
    this.actividadService.listarTodas(this.paginaActual, this.registrosPorPagina).subscribe({
      next: (page) => {
        this.listaActividades = page.content;
        this.totalPaginas = page.totalPages;
        this.totalRegistros = page.totalElements;
        this.paginaActual = page.number;
      },
      error: () => {
        this.listaActividades = [];
        this.totalPaginas = 0;
        this.totalRegistros = 0;
      }
    });
  }

  obtenerTiposMovimiento(): void {
    this.actividadService.listarTiposMovimiento().subscribe({
      next: (tipos) => this.tiposMovimiento = tipos,
      error: () => this.tiposMovimiento = []
      // El interceptor global ya mostró el mensaje enviado por Spring Boot.
    });
  }

  cambiarPagina(pagina: number): void {
    this.paginaActual = pagina;
    this.obtenerTodas();
  }

  guardar(): void {
    this.campoTocado = true;

    if (this.nombreActividadInvalido) {
      this.alertService.warning('El nombre de la actividad es obligatorio.');
      return;
    }
    if (this.tipoMovimientoInvalido) {
      this.alertService.warning('Debe seleccionar si la actividad corresponde a Ingresos o Egresos.');
      return;
    }

    const actividad: Actividad = {
      idActividad: this.actividadSeleccionada.idActividad,
      nombreActividad: this.actividadSeleccionada.nombreActividad.trim(),
      tipoMovimiento: this.actividadSeleccionada.tipoMovimiento
    };

    const request$ = this.esEdicion
      ? this.actividadService.actualizar(actividad)
      : this.actividadService.crear(actividad);

    request$.subscribe({
      next: () => {
        this.alertService.success(this.esEdicion
          ? 'Actividad actualizada correctamente.'
          : 'Actividad creada correctamente.');
        this.limpiarFormulario();
        this.obtenerTodas();
      },
      error: () => { /* El interceptor global muestra el mensaje enviado por Spring Boot. */ }
    });
  }

  prepararEdicion(actividad: Actividad): void {
    this.actividadSeleccionada = { ...actividad };
    this.esEdicion = true;
    this.campoTocado = false;
  }

  eliminar(id: number): void {
    if (!window.confirm('¿Está seguro de eliminar esta actividad?')) {
      return;
    }

    this.actividadService.eliminar(id).subscribe({
      next: () => {
        this.alertService.success('Actividad eliminada correctamente.');
        this.obtenerTodas();
      },
      error: () => { /* Mensaje gestionado globalmente. */ }
    });
  }

  limpiarFormulario(): void {
    this.actividadSeleccionada = this.inicializarActividad();
    this.esEdicion = false;
    this.campoTocado = false;
  }

  obtenerEtiquetaTipo(tipo?: TipoMovimiento | null): string {
    return this.tiposMovimiento.find(opcion => opcion.valor === tipo)?.etiqueta ?? 'Sin clasificar';
  }

  private inicializarActividad(): Actividad {
    return {
      nombreActividad: '',
      tipoMovimiento: null
    };
  }
}
