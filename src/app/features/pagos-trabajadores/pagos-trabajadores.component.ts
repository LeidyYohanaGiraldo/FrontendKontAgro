import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { PaginacionComponent } from '../../shared/components/paginacion/paginacion.component';
import { TextoTruncadoComponent } from '../../shared/components/texto-truncado/texto-truncado.component';
import { UiIconComponent } from '../../shared/components/ui-icon/ui-icon.component';
import { AlertService } from '../../shared/services/alert.service';
import { TareaRealizada } from '../tareas-realizadas/models/tarea-realizada.model';
import { TareaRealizadaService } from '../tareas-realizadas/services/tarea-realizada.service';
import { Trabajador } from '../trabajadores/models/trabajador.model';
import { TrabajadorService } from '../trabajadores/services/trabajador.service';
import { PagoTrabajador, PagoTrabajadorForm, PagoTrabajadorPayload } from './models/pago-trabajador.model';
import { PagoTrabajadorService } from './services/pago-trabajador.service';

@Component({
  selector: 'app-pagos-trabajadores',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginacionComponent, UiIconComponent, TextoTruncadoComponent],
  templateUrl: './pagos-trabajadores.component.html',
  styleUrl: '../../shared/styles/gestion-crud.scss'
})
export class PagosTrabajadoresComponent implements OnInit {
  private readonly pagoService = inject(PagoTrabajadorService);
  private readonly trabajadorService = inject(TrabajadorService);
  private readonly tareaService = inject(TareaRealizadaService);
  private readonly alertService = inject(AlertService);

  listaPagos: PagoTrabajador[] = [];
  listaTrabajadores: Trabajador[] = [];
  listaTareas: TareaRealizada[] = [];
  pagoSeleccionado: PagoTrabajadorForm = this.inicializarPago();
  esEdicion = false;
  guardando = false;
  cargandoPagos = false;
  eliminandoId: number | null = null;
  paginaActual = 0;
  readonly registrosPorPagina = 5;
  readonly fechaMaximaDiaTrabajado = this.obtenerFechaLocalActual();

  get totalPaginas(): number { return Math.ceil(this.listaPagos.length / this.registrosPorPagina); }
  get pagosVisibles(): PagoTrabajador[] {
    const inicio = this.paginaActual * this.registrosPorPagina;
    return this.listaPagos.slice(inicio, inicio + this.registrosPorPagina);
  }

  ngOnInit(): void {
    this.cargarPagos();
    this.cargarTrabajadores();
    this.cargarTareas();
  }

  cargarPagos(): void {
    this.cargandoPagos = true;
    this.pagoService.listarTodos()
      .pipe(finalize(() => this.cargandoPagos = false))
      .subscribe({
        next: (pagos) => {
          this.listaPagos = pagos;
          this.ajustarPaginaActual();
        }
      });
  }

  cargarTrabajadores(): void {
    this.trabajadorService.listarTodos().subscribe({
      next: (trabajadores) => this.listaTrabajadores = trabajadores
    });
  }

  cargarTareas(): void {
    this.tareaService.listarTodas().subscribe({
      next: (tareas) => this.listaTareas = tareas
    });
  }

  guardar(): void {
    if (this.guardando) return;

    const pago = this.construirPayload();
    if (!pago) return;

    const eraEdicion = this.esEdicion;
    const request$ = eraEdicion ? this.pagoService.actualizar(pago) : this.pagoService.crear(pago);
    this.guardando = true;

    request$
      .pipe(finalize(() => this.guardando = false))
      .subscribe({
        next: () => {
          this.alertService.success(eraEdicion ? 'Pago actualizado correctamente' : 'Pago registrado exitosamente');
          this.limpiarFormulario();
          this.cargarPagos();
        }
      });
  }

  prepararEdicion(pago: PagoTrabajador): void {
    if (pago.estado === 'PAGADO') {
      this.alertService.warning('Los pagos liquidados no se pueden editar');
      return;
    }

    this.pagoSeleccionado = {
      id: pago.id,
      idTrabajador: pago.idTrabajador,
      idTarea: pago.idTarea,
      diasTrabajados: [...(pago.diasTrabajados ?? [])].sort(),
      diaAAgregar: '',
      rangoDesde: '',
      rangoHasta: '',
      valorPagar: pago.valorPagar,
      valorDescuentos: pago.valorDescuentos,
      observaciones: pago.observaciones ?? null
    };
    this.esEdicion = true;
  }

  eliminar(pago: PagoTrabajador): void {
    if (!pago.id || pago.estado === 'PAGADO') {
      this.alertService.warning('Solo se pueden eliminar pagos pendientes');
      return;
    }
    if (pago.tieneHistorialNomina) {
      this.alertService.warning('Este pago pertenece al historial de una liquidación y no puede eliminarse');
      return;
    }
    if (this.eliminandoId != null) return;
    if (!window.confirm('¿Desea eliminar este pago pendiente? Esta acción no se puede deshacer.')) return;

    this.eliminandoId = pago.id;
    this.pagoService.eliminar(pago.id)
      .pipe(finalize(() => this.eliminandoId = null))
      .subscribe({
        next: () => {
          this.alertService.success('Pago eliminado correctamente');
          if (this.pagoSeleccionado.id === pago.id) this.limpiarFormulario();
          this.cargarPagos();
        }
      });
  }

  limpiarFormulario(): void {
    this.pagoSeleccionado = this.inicializarPago();
    this.esEdicion = false;
  }

  obtenerNombreTrabajador(idTrabajador: number): string {
    return this.listaTrabajadores.find(t => t.id === idTrabajador)?.nombre ?? `Trabajador #${idTrabajador}`;
  }

  obtenerNombreTarea(idTarea: number | null, nombreTarea?: string | null): string {
    if (nombreTarea) return nombreTarea;
    if (idTarea == null) return 'Tarea histórica sin clasificar';
    return this.listaTareas.find(t => t.id === idTarea)?.nombre ?? `Tarea #${idTarea}`;
  }

  obtenerValorNeto(pago: PagoTrabajador): number {
    return (pago.valorPagar ?? 0) - (pago.valorDescuentos ?? 0);
  }

  cambiarPagina(pagina: number): void {
    this.paginaActual = pagina;
  }

  agregarDiaTrabajado(): void {
    const fecha = this.pagoSeleccionado.diaAAgregar;
    if (!fecha) {
      this.alertService.warning('Seleccione una fecha para agregarla como día trabajado');
      return;
    }
    if (!this.fechaPermitida(fecha)) return;

    const agregados = this.agregarDiasSinDuplicar([fecha]);
    if (agregados === 0) {
      this.alertService.warning('La fecha seleccionada ya está incluida en este pago');
      return;
    }
    this.pagoSeleccionado.diaAAgregar = '';
  }

  agregarRangoTrabajado(): void {
    const desde = this.pagoSeleccionado.rangoDesde;
    const hasta = this.pagoSeleccionado.rangoHasta;

    if (!desde || !hasta) {
      this.alertService.warning('Seleccione la fecha inicial y final del rango trabajado');
      return;
    }
    if (!this.fechaPermitida(desde) || !this.fechaPermitida(hasta)) return;
    if (desde > hasta) {
      this.alertService.warning('La fecha inicial del rango no puede ser posterior a la fecha final');
      return;
    }

    const diasRango = this.generarRangoFechas(desde, hasta);
    const agregados = this.agregarDiasSinDuplicar(diasRango);
    if (agregados === 0) {
      this.alertService.warning('Todos los días del rango ya estaban incluidos en este pago');
      return;
    }

    this.pagoSeleccionado.rangoDesde = '';
    this.pagoSeleccionado.rangoHasta = '';
  }

  quitarDiaTrabajado(fecha: string): void {
    this.pagoSeleccionado.diasTrabajados = this.pagoSeleccionado.diasTrabajados.filter(dia => dia !== fecha);
  }

  formatearDia(fecha: string): string {
    const [year, month, day] = fecha.split('-');
    return `${day}/${month}/${year}`;
  }

  formatearDiaLargo(fecha: string): string {
    const [year, month, day] = fecha.split('-').map(Number);
    if (!year || !month || !day) return fecha;

    return new Intl.DateTimeFormat('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC'
    }).format(new Date(Date.UTC(year, month - 1, day)));
  }

  formatearDiasLargos(dias: string[] | null | undefined): string {
    if (!dias?.length) return 'Sin días registrados';
    return [...dias].sort().map(dia => this.formatearDiaLargo(dia)).join('\n');
  }

  resumenDias(dias: string[] | null | undefined): string {
    const cantidad = dias?.length ?? 0;
    return `${cantidad} ${cantidad === 1 ? 'día' : 'días'}`;
  }

  private inicializarPago(): PagoTrabajadorForm {
    return {
      idTrabajador: null,
      idTarea: null,
      diasTrabajados: [],
      diaAAgregar: '',
      rangoDesde: '',
      rangoHasta: '',
      valorPagar: null,
      valorDescuentos: null,
      observaciones: null
    };
  }

  private agregarDiasSinDuplicar(dias: string[]): number {
    const actuales = new Set(this.pagoSeleccionado.diasTrabajados);
    const cantidadAntes = actuales.size;
    dias.forEach(dia => actuales.add(dia));
    this.pagoSeleccionado.diasTrabajados = [...actuales].sort();
    return actuales.size - cantidadAntes;
  }

  private generarRangoFechas(desde: string, hasta: string): string[] {
    const inicio = this.fechaUtc(desde);
    const fin = this.fechaUtc(hasta);
    const resultado: string[] = [];
    const unDia = 24 * 60 * 60 * 1000;

    for (let actual = inicio.getTime(); actual <= fin.getTime(); actual += unDia) {
      resultado.push(new Date(actual).toISOString().slice(0, 10));
    }
    return resultado;
  }

  private fechaUtc(fecha: string): Date {
    const [year, month, day] = fecha.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  }

  private fechaPermitida(fecha: string): boolean {
    if (fecha > this.fechaMaximaDiaTrabajado) {
      this.alertService.warning('No puede registrar un día trabajado posterior a la fecha actual');
      return false;
    }
    return true;
  }

  private construirPayload(): PagoTrabajadorPayload | null {
    const pago = this.pagoSeleccionado;
    const valorPagar = pago.valorPagar == null ? Number.NaN : Number(pago.valorPagar);
    const valorDescuentos = pago.valorDescuentos == null ? 0 : Number(pago.valorDescuentos);

    if (!pago.idTrabajador) { this.alertService.warning('Debe seleccionar un trabajador'); return null; }
    if (!pago.idTarea) { this.alertService.warning('Debe seleccionar una tarea'); return null; }
    if (!pago.diasTrabajados.length) { this.alertService.warning('Debe registrar al menos un día trabajado'); return null; }
    if (!Number.isFinite(valorPagar) || valorPagar <= 0) { this.alertService.warning('El valor a pagar debe ser mayor que cero'); return null; }
    if (!Number.isFinite(valorDescuentos) || valorDescuentos < 0) { this.alertService.warning('El valor de descuentos no puede ser negativo'); return null; }
    if (valorDescuentos > valorPagar) { this.alertService.warning('Los descuentos no pueden superar el valor a pagar'); return null; }

    const observaciones = pago.observaciones?.trim() ?? '';
    if (observaciones.length > 255) { this.alertService.warning('Las observaciones no pueden superar los 255 caracteres'); return null; }

    return {
      id: pago.id,
      idTrabajador: pago.idTrabajador,
      idTarea: pago.idTarea,
      diasTrabajados: [...pago.diasTrabajados].sort(),
      valorPagar,
      valorDescuentos,
      observaciones: observaciones || null
    };
  }

  private ajustarPaginaActual(): void {
    if (this.totalPaginas === 0) this.paginaActual = 0;
    else if (this.paginaActual >= this.totalPaginas) this.paginaActual = this.totalPaginas - 1;
  }

  private obtenerFechaLocalActual(): string {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
