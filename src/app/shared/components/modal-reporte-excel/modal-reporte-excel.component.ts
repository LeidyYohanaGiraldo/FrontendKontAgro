import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-reporte-excel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-reporte-excel.component.html',
  styleUrl: './modal-reporte-excel.component.scss'
})
export class ModalReporteExcelComponent {
  @Output() cerrar = new EventEmitter<void>();

  @Output() generar = new EventEmitter<{
    fechaInicial: string,
    fechaFinal: string
  }>();

  fechaInicial = '';
  fechaFinal = '';

  generarReporte() {

    if (!this.fechaInicial || !this.fechaFinal) {
      alert('Debe seleccionar ambas fechas');
      return;
    }

    this.generar.emit({
      fechaInicial: this.fechaInicial,
      fechaFinal: this.fechaFinal
    });
  }

  cerrarModal() {
    this.cerrar.emit();
  }

}
