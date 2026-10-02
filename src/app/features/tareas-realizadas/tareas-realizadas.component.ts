import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaginacionComponent } from '../../shared/components/paginacion/paginacion.component';
import { TextoTruncadoComponent } from '../../shared/components/texto-truncado/texto-truncado.component';
import { UiIconComponent } from '../../shared/components/ui-icon/ui-icon.component';
import { AlertService } from '../../shared/services/alert.service';
import { TareaRealizada } from './models/tarea-realizada.model';
import { TareaRealizadaService } from './services/tarea-realizada.service';

@Component({
  selector: 'app-tareas-realizadas',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginacionComponent, UiIconComponent, TextoTruncadoComponent],
  templateUrl: './tareas-realizadas.component.html',
  styleUrl: '../../shared/styles/gestion-crud.scss'
})
export class TareasRealizadasComponent implements OnInit {
  private readonly tareaService = inject(TareaRealizadaService);
  private readonly alertService = inject(AlertService);

  listaTareas: TareaRealizada[] = [];
  tareaSeleccionada: TareaRealizada = this.inicializarTarea();
  esEdicion = false;
  paginaActual = 0;
  readonly registrosPorPagina = 5;

  get totalPaginas(): number {
    return Math.ceil(this.listaTareas.length / this.registrosPorPagina);
  }

  get tareasVisibles(): TareaRealizada[] {
    const inicio = this.paginaActual * this.registrosPorPagina;
    return this.listaTareas.slice(inicio, inicio + this.registrosPorPagina);
  }

  ngOnInit(): void {
    this.cargarTareas();
  }

  cargarTareas(): void {
    this.tareaService.listarTodas().subscribe({
      next: (tareas) => {
        this.listaTareas = tareas;
        this.ajustarPaginaActual();
      },
      error: () => {
        this.listaTareas = [];
        this.ajustarPaginaActual();
      }
    });
  }

  guardar(): void {
    const nombre = this.tareaSeleccionada.nombre?.trim();
    const descripcion = this.tareaSeleccionada.descripcion?.trim() || null;
    if (!nombre) {
      this.alertService.warning('El nombre de la tarea es obligatorio');
      return;
    }
    if (nombre.length > 120) {
      this.alertService.warning('El nombre de la tarea no puede superar los 120 caracteres');
      return;
    }
    if (descripcion && descripcion.length > 255) {
      this.alertService.warning('La descripción no puede superar los 255 caracteres');
      return;
    }

    const payload: TareaRealizada = {
      ...this.tareaSeleccionada,
      nombre,
      descripcion
    };
    const request$ = this.esEdicion
      ? this.tareaService.actualizar(payload)
      : this.tareaService.crear(payload);

    request$.subscribe({
      next: () => {
        this.alertService.success(this.esEdicion ? 'Tarea actualizada correctamente' : 'Tarea creada correctamente');
        this.limpiarFormulario();
        this.cargarTareas();
      },
      error: () => { /* El interceptor global muestra el mensaje enviado por el backend. */ }
    });
  }

  prepararEdicion(tarea: TareaRealizada): void {
    this.tareaSeleccionada = { ...tarea };
    this.esEdicion = true;
  }

  cambiarEstado(tarea: TareaRealizada): void {
    if (!tarea.id) return;
    const nuevoEstado = !tarea.activo;
    this.tareaService.cambiarEstado(tarea.id, nuevoEstado).subscribe({
      next: () => {
        this.alertService.success(nuevoEstado ? 'Tarea activada correctamente' : 'Tarea desactivada correctamente');
        this.cargarTareas();
      },
      error: () => { /* Mensaje gestionado globalmente. */ }
    });
  }

  eliminar(tarea: TareaRealizada): void {
    if (!tarea.id) return;
    if (!window.confirm('¿Desea eliminar esta tarea? Si ya fue utilizada en pagos, el sistema protegerá su historial.')) {
      return;
    }
    this.tareaService.eliminar(tarea.id).subscribe({
      next: () => {
        this.alertService.success('Tarea eliminada correctamente');
        this.limpiarFormulario();
        this.cargarTareas();
      },
      error: () => { /* Mensaje gestionado globalmente. */ }
    });
  }

  limpiarFormulario(): void {
    this.tareaSeleccionada = this.inicializarTarea();
    this.esEdicion = false;
  }

  cambiarPagina(pagina: number): void {
    this.paginaActual = pagina;
  }

  private inicializarTarea(): TareaRealizada {
    return { nombre: '', descripcion: null, activo: true };
  }

  private ajustarPaginaActual(): void {
    if (this.totalPaginas === 0) this.paginaActual = 0;
    else if (this.paginaActual >= this.totalPaginas) this.paginaActual = this.totalPaginas - 1;
  }
}
