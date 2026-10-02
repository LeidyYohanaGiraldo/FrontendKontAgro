import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { PaginacionComponent } from '../../shared/components/paginacion/paginacion.component';
import { UiIconComponent } from '../../shared/components/ui-icon/ui-icon.component';
import { AlertService } from '../../shared/services/alert.service';
import { ContabilidadResumen, MovimientoContable, ObligacionPendiente } from './models/contabilidad.model';
import { ContabilidadService } from './services/contabilidad.service';

@Component({
  selector: 'app-contabilidad',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginacionComponent, UiIconComponent],
  templateUrl: './contabilidad.component.html',
  styleUrls: ['../../shared/styles/gestion-crud.scss', './contabilidad.component.scss']
})
export class ContabilidadComponent implements OnInit {
  private readonly contabilidadService = inject(ContabilidadService);
  private readonly alertService = inject(AlertService);

  fechaInicial = '';
  fechaFinal = '';
  resumen: ContabilidadResumen | null = null;
  cargando = false;
  generandoReporte = false;
  generandoPaquete = false;
  paginaActual = 0;
  readonly registrosPorPagina = 8;

  get movimientos(): MovimientoContable[] {
    return this.resumen?.movimientos ?? [];
  }

  get obligacionesPendientes(): ObligacionPendiente[] {
    return this.resumen?.obligacionesPendientes ?? [];
  }

  get totalPaginas(): number {
    return Math.ceil(this.movimientos.length / this.registrosPorPagina);
  }

  get movimientosVisibles(): MovimientoContable[] {
    const inicio = this.paginaActual * this.registrosPorPagina;
    return this.movimientos.slice(inicio, inicio + this.registrosPorPagina);
  }

  ngOnInit(): void {
    const hoy = new Date();
    this.fechaFinal = this.formatearFechaLocal(hoy);
    this.fechaInicial = this.formatearFechaLocal(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
    this.consultar();
  }

  consultar(): void {
    if (!this.validarFechas()) return;

    this.cargando = true;
    this.contabilidadService.consultarResumen(this.fechaInicial, this.fechaFinal)
      .pipe(finalize(() => this.cargando = false))
      .subscribe({
        next: (resumen) => {
          this.resumen = resumen;
          this.paginaActual = 0;
        }
      });
  }

  descargarPdf(): void {
    if (!this.validarFechas() || this.generandoReporte) return;

    this.generandoReporte = true;
    this.contabilidadService.descargarReportePdf(this.fechaInicial, this.fechaFinal)
      .pipe(finalize(() => this.generandoReporte = false))
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const enlace = document.createElement('a');
          enlace.href = url;
          enlace.download = `kontagro_reporte_financiero_${this.fechaInicial}_al_${this.fechaFinal}.pdf`;
          enlace.click();
          URL.revokeObjectURL(url);
          this.alertService.success('Reporte financiero generado correctamente');
        }
      });
  }

  descargarPaqueteContador(): void {
    if (!this.validarFechas() || this.generandoPaquete) return;

    this.generandoPaquete = true;
    this.contabilidadService.descargarPaqueteContador(this.fechaInicial, this.fechaFinal)
      .pipe(finalize(() => this.generandoPaquete = false))
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const enlace = document.createElement('a');
          enlace.href = url;
          enlace.download = `kontagro_contabilidad_${this.fechaInicial}_al_${this.fechaFinal}.zip`;
          enlace.click();
          URL.revokeObjectURL(url);
          this.alertService.success('Paquete contable generado correctamente');
        }
      });
  }

  cambiarPagina(pagina: number): void {
    this.paginaActual = pagina;
  }

  formatearDias(dias: string[] | null | undefined): string {
    if (!dias?.length) return '-';
    return dias.map(fecha => {
      const [year, month, day] = fecha.split('-');
      return `${day}/${month}/${year}`;
    }).join(', ');
  }

  etiquetaOrigen(origen: MovimientoContable['origen']): string {
    if (origen === 'NOMINA') return 'Nómina';
    if (origen === 'EGRESO') return 'Egreso';
    return 'Ingreso';
  }

  private validarFechas(): boolean {
    if (!this.fechaInicial || !this.fechaFinal) {
      this.alertService.warning('Debe seleccionar la fecha inicial y final');
      return false;
    }
    if (this.fechaInicial > this.fechaFinal) {
      this.alertService.warning('La fecha inicial no puede ser posterior a la fecha final');
      return false;
    }
    return true;
  }

  private formatearFechaLocal(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
