import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-texto-truncado',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './texto-truncado.component.html',
  styleUrl: './texto-truncado.component.scss'
})
export class TextoTruncadoComponent {
  @Input() texto: string | null | undefined;
  @Input() detalle: string | null | undefined;
  @Input() fallback = '-';

  expandido = false;

  get valor(): string {
    const texto = this.texto?.trim();
    return texto ? texto : this.fallback;
  }

  get contenidoDetalle(): string {
    const detalle = this.detalle?.trim();
    return detalle || this.valor;
  }

  alternar(): void {
    this.expandido = !this.expandido;
  }

  manejarTeclado(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    this.alternar();
  }
}
