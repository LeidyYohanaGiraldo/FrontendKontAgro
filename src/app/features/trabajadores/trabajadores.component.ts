import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaginacionComponent } from '../../shared/components/paginacion/paginacion.component';
import { TextoTruncadoComponent } from '../../shared/components/texto-truncado/texto-truncado.component';
import { UiIconComponent } from '../../shared/components/ui-icon/ui-icon.component';
import { AlertService } from '../../shared/services/alert.service';
import { Trabajador } from './models/trabajador.model';
import { TrabajadorService } from './services/trabajador.service';

@Component({
  selector: 'app-trabajadores',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginacionComponent, UiIconComponent, TextoTruncadoComponent],
  templateUrl: './trabajadores.component.html',
  styleUrl: '../../shared/styles/gestion-crud.scss'
})
export class TrabajadoresComponent implements OnInit {
  private readonly trabajadorService = inject(TrabajadorService);
  private readonly alertService = inject(AlertService);

  listaTrabajadores: Trabajador[] = [];
  trabajadorSeleccionado: Trabajador = this.inicializarTrabajador();
  esEdicion = false;

  paginaActual = 0;
  readonly registrosPorPagina = 5;

  get totalPaginas(): number {
    return Math.ceil(this.listaTrabajadores.length / this.registrosPorPagina);
  }

  get trabajadoresVisibles(): Trabajador[] {
    const inicio = this.paginaActual * this.registrosPorPagina;
    return this.listaTrabajadores.slice(inicio, inicio + this.registrosPorPagina);
  }

  ngOnInit(): void {
    this.cargarTrabajadores();
  }

  cargarTrabajadores(): void {
    this.trabajadorService.listarTodos().subscribe({
      next: (trabajadores) => {
        this.listaTrabajadores = trabajadores;
        this.ajustarPaginaActual();
      }
    });
  }

  guardar(): void {
    const nombre = this.trabajadorSeleccionado.nombre.trim();

    if (!nombre) {
      this.alertService.warning('El nombre del trabajador es obligatorio');
      return;
    }

    const trabajador: Trabajador = {
      ...this.trabajadorSeleccionado,
      nombre
    };

    const request$ = this.esEdicion
      ? this.trabajadorService.actualizar(trabajador)
      : this.trabajadorService.crear(trabajador);

    request$.subscribe({
      next: () => {
        this.alertService.success(
          this.esEdicion
            ? 'Trabajador actualizado correctamente'
            : 'Trabajador registrado exitosamente'
        );
        this.limpiarFormulario();
        this.cargarTrabajadores();
      }
    });
  }

  prepararEdicion(trabajador: Trabajador): void {
    this.trabajadorSeleccionado = { ...trabajador };
    this.esEdicion = true;
  }

  eliminar(trabajador: Trabajador): void {
    if (!trabajador.id) {
      return;
    }

    const confirmado = window.confirm(
      `¿Desea eliminar al trabajador ${trabajador.nombre}? Solo será posible si no tiene movimientos contables asociados.`
    );
    if (!confirmado) {
      return;
    }

    this.trabajadorService.eliminar(trabajador.id).subscribe({
      next: () => {
        this.alertService.success('Trabajador eliminado correctamente');
        if (this.trabajadorSeleccionado.id === trabajador.id) {
          this.limpiarFormulario();
        }
        this.cargarTrabajadores();
      }
    });
  }

  limpiarFormulario(): void {
    this.trabajadorSeleccionado = this.inicializarTrabajador();
    this.esEdicion = false;
  }

  cambiarPagina(pagina: number): void {
    this.paginaActual = pagina;
  }

  private inicializarTrabajador(): Trabajador {
    return { nombre: '' };
  }

  private ajustarPaginaActual(): void {
    if (this.totalPaginas === 0) {
      this.paginaActual = 0;
      return;
    }

    if (this.paginaActual >= this.totalPaginas) {
      this.paginaActual = this.totalPaginas - 1;
    }
  }
}
