import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-paginacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './paginacion.component.html',
  styleUrl: './paginacion.component.scss'
})
export class PaginacionComponent {
  @Input() paginaActual: number = 0;
  @Input() totalPaginas: number = 0;
  @Input() totalRegistros: number = 0;
  @Input() tamanoPagina: number = 5;

  @Output() cambiar = new EventEmitter<number>();

  get registroInicial(): number {
    if (this.totalRegistros === 0) {
      return 0;
    }
    return (this.paginaActual * this.tamanoPagina) + 1;
  }

  get registroFinal(): number {
    const final =
      (this.paginaActual + 1) * this.tamanoPagina;

    return final > this.totalRegistros
      ? this.totalRegistros
      : final;
  }

  get paginas(): number[] {
    return Array(this.totalPaginas)
      .fill(0)
      .map((_, i) => i);
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 0 && pagina < this.totalPaginas) {
      this.cambiar.emit(pagina);
    }
  }
}
