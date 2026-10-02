import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { PaginacionComponent } from '../../shared/components/paginacion/paginacion.component';
import { UiIconComponent } from '../../shared/components/ui-icon/ui-icon.component';
import { AlertService } from '../../shared/services/alert.service';
import { PagoTrabajador } from '../pagos-trabajadores/models/pago-trabajador.model';
import { PagoTrabajadorService } from '../pagos-trabajadores/services/pago-trabajador.service';
import { Trabajador } from '../trabajadores/models/trabajador.model';
import { TrabajadorService } from '../trabajadores/services/trabajador.service';
import { LiquidacionNomina, LiquidarNominaRequest } from './models/liquidacion-nomina.model';
import { LiquidacionNominaService } from './services/liquidacion-nomina.service';

@Component({
  selector: 'app-liquidaciones-nomina',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginacionComponent, UiIconComponent],
  templateUrl: './liquidaciones-nomina.component.html',
  styleUrl: '../../shared/styles/gestion-crud.scss'
})
export class LiquidacionesNominaComponent implements OnInit {
  private readonly liquidacionService = inject(LiquidacionNominaService);
  private readonly pagoService = inject(PagoTrabajadorService);
  private readonly trabajadorService = inject(TrabajadorService);
  private readonly alertService = inject(AlertService);

  listaLiquidaciones: LiquidacionNomina[] = [];
  listaTrabajadores: Trabajador[] = [];
  pagosPendientes: PagoTrabajador[] = [];
  pagosDetalle: PagoTrabajador[] = [];
  idTrabajadorSeleccionado = 0;
  idLiquidacionDetalle: number | null = null;
  procesandoLiquidacion = false;

  private readonly idsPagosSeleccionados = new Set<number>();

  paginaActual = 0;
  readonly registrosPorPagina = 5;

  get totalPaginas(): number {
    return Math.ceil(this.listaLiquidaciones.length / this.registrosPorPagina);
  }

  get liquidacionesVisibles(): LiquidacionNomina[] {
    const inicio = this.paginaActual * this.registrosPorPagina;
    return this.listaLiquidaciones.slice(inicio, inicio + this.registrosPorPagina);
  }

  get pagosSeleccionados(): PagoTrabajador[] {
    return this.pagosPendientes.filter(pago => pago.id != null && this.idsPagosSeleccionados.has(pago.id));
  }

  get pagosLiquidables(): PagoTrabajador[] {
    return this.pagosPendientes.filter(pago => pago.id != null && pago.valorPagar != null && pago.valorPagar > 0 && !!pago.idTarea && (pago.diasTrabajados?.length ?? 0) > 0);
  }

  get todosSeleccionados(): boolean {
    return this.pagosLiquidables.length > 0 &&
      this.pagosLiquidables.every(pago => pago.id != null && this.idsPagosSeleccionados.has(pago.id));
  }

  get fechaInicialCalculada(): string | null {
    const fechas = this.diasSeleccionados;
    return fechas.length ? fechas[0] : null;
  }

  get fechaFinalCalculada(): string | null {
    const fechas = this.diasSeleccionados;
    return fechas.length ? fechas[fechas.length - 1] : null;
  }

  get totalTrabajadoCalculado(): number {
    return this.pagosSeleccionados.reduce((total, pago) => total + (pago.valorPagar ?? 0), 0);
  }

  get totalDescuentosCalculado(): number {
    return this.pagosSeleccionados.reduce((total, pago) => total + (pago.valorDescuentos ?? 0), 0);
  }

  get totalPagadoCalculado(): number {
    return this.totalTrabajadoCalculado - this.totalDescuentosCalculado;
  }

  ngOnInit(): void {
    this.cargarLiquidaciones();
    this.cargarTrabajadores();
  }

  cargarLiquidaciones(): void {
    this.liquidacionService.listarTodas().subscribe({
      next: (liquidaciones) => {
        this.listaLiquidaciones = liquidaciones;
        this.ajustarPaginaActual();
      },
      error: () => {
        this.listaLiquidaciones = [];
        this.ajustarPaginaActual();
      }
    });
  }

  cargarTrabajadores(): void {
    this.trabajadorService.listarTodos().subscribe({
      next: (trabajadores) => this.listaTrabajadores = trabajadores,
      error: () => this.listaTrabajadores = []
    });
  }

  cambiarTrabajador(): void {
    this.idsPagosSeleccionados.clear();
    this.pagosPendientes = [];

    if (!this.idTrabajadorSeleccionado) return;

    this.pagoService.listarPendientesPorTrabajador(this.idTrabajadorSeleccionado).subscribe({
      next: (pagos) => this.pagosPendientes = pagos,
      error: () => this.pagosPendientes = []
    });
  }

  estaSeleccionado(pago: PagoTrabajador): boolean {
    return pago.id != null && this.idsPagosSeleccionados.has(pago.id);
  }

  cambiarSeleccion(pago: PagoTrabajador, seleccionado: boolean): void {
    if (!pago.id || !this.pagoEsLiquidable(pago)) return;
    seleccionado ? this.idsPagosSeleccionados.add(pago.id) : this.idsPagosSeleccionados.delete(pago.id);
  }

  cambiarSeleccionTodos(seleccionado: boolean): void {
    if (seleccionado) {
      this.pagosLiquidables.forEach(pago => pago.id && this.idsPagosSeleccionados.add(pago.id));
    } else {
      this.idsPagosSeleccionados.clear();
    }
  }

  liquidar(): void {
    if (this.procesandoLiquidacion) return;
    if (!this.idTrabajadorSeleccionado) {
      this.alertService.warning('Debe seleccionar un trabajador');
      return;
    }

    const idsPagos = Array.from(this.idsPagosSeleccionados);
    if (idsPagos.length === 0) {
      this.alertService.warning('Debe seleccionar al menos un pago pendiente');
      return;
    }
    if (this.totalPagadoCalculado < 0) {
      this.alertService.warning('Los descuentos no pueden superar el total trabajado');
      return;
    }

    const request: LiquidarNominaRequest = { idTrabajador: this.idTrabajadorSeleccionado, idsPagos };
    this.procesandoLiquidacion = true;
    this.liquidacionService.liquidar(request)
      .pipe(finalize(() => this.procesandoLiquidacion = false))
      .subscribe({
        next: () => {
          this.alertService.success('Liquidación de nómina realizada correctamente');
          this.idsPagosSeleccionados.clear();
          this.cargarLiquidaciones();
          this.cambiarTrabajador();
        },
        error: () => { /* El interceptor global muestra el mensaje del backend. */ }
      });
  }

  verDetalle(liquidacion: LiquidacionNomina): void {
    if (!liquidacion.id) return;
    if (this.idLiquidacionDetalle === liquidacion.id) {
      this.cerrarDetalle();
      return;
    }

    this.liquidacionService.listarPagos(liquidacion.id).subscribe({
      next: (pagos) => {
        this.idLiquidacionDetalle = liquidacion.id ?? null;
        this.pagosDetalle = pagos;
      },
      error: () => this.cerrarDetalle()
    });
  }

  cerrarDetalle(): void {
    this.idLiquidacionDetalle = null;
    this.pagosDetalle = [];
  }

  anular(liquidacion: LiquidacionNomina): void {
    if (!liquidacion.id || liquidacion.estado === 'ANULADA') return;

    const confirmado = window.confirm(
      '¿Desea anular esta liquidación? Los pagos asociados volverán al estado Pendiente y la liquidación se conservará como historial.'
    );
    if (!confirmado) return;

    this.liquidacionService.anular(liquidacion.id).subscribe({
      next: () => {
        this.alertService.success('Liquidación anulada correctamente. Los pagos volvieron a estado pendiente.');
        this.cerrarDetalle();
        this.cargarLiquidaciones();
        if (this.idTrabajadorSeleccionado === liquidacion.idTrabajador) this.cambiarTrabajador();
      },
      error: () => { /* Mensaje gestionado globalmente. */ }
    });
  }

  pagoEsLiquidable(pago: PagoTrabajador): boolean {
    return !!pago.idTarea && pago.valorPagar != null && pago.valorPagar > 0 && (pago.diasTrabajados?.length ?? 0) > 0;
  }

  obtenerDiasPago(pago: PagoTrabajador): string {
    const dias = pago.diasTrabajados ?? [];
    if (!dias.length) return 'Sin días registrados';
    return dias.map(fecha => {
      const [year, month, day] = fecha.split('-');
      return `${day}/${month}/${year}`;
    }).join(', ');
  }

  get totalDiasSeleccionados(): number {
    return this.diasSeleccionados.length;
  }

  private get diasSeleccionados(): string[] {
    return Array.from(new Set(
      this.pagosSeleccionados.flatMap(pago => pago.diasTrabajados ?? [])
    )).sort();
  }

  obtenerNombreTrabajador(idTrabajador: number): string {
    return this.listaTrabajadores.find(trabajador => trabajador.id === idTrabajador)?.nombre ?? '';
  }

  obtenerNombreTarea(idTarea: number | null, nombreTarea?: string | null): string {
    if (nombreTarea?.trim()) return nombreTarea;
    if (idTarea == null) return 'Tarea histórica sin clasificar';
    return `Tarea #${idTarea}`;
  }

  obtenerNetoPago(pago: PagoTrabajador): number {
    return (pago.valorPagar ?? 0) - (pago.valorDescuentos ?? 0);
  }

  cambiarPagina(pagina: number): void { this.paginaActual = pagina; }

  private ajustarPaginaActual(): void {
    if (this.totalPaginas === 0) this.paginaActual = 0;
    else if (this.paginaActual >= this.totalPaginas) this.paginaActual = this.totalPaginas - 1;
  }
}
