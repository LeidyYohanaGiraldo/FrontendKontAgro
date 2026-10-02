import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DocumentoSoporte, DocumentoSoporteForm, TipoDocumentoSoporte } from '../../models/documento-soporte.model';
import { AlertService } from '../../services/alert.service';
import { DocumentoSoporteService } from '../../services/documento-soporte.service';
import { UiIconComponent } from '../ui-icon/ui-icon.component';

@Component({
  selector: 'app-documentos-soporte',
  standalone: true,
  imports: [CommonModule, FormsModule, UiIconComponent],
  templateUrl: './documentos-soporte.component.html',
  styleUrl: './documentos-soporte.component.scss'
})
export class DocumentosSoporteComponent implements OnChanges {
  @Input({ required: true }) origen!: 'INGRESO' | 'EGRESO';
  @Input({ required: true }) movimientoId!: number;

  private readonly service = inject(DocumentoSoporteService);
  private readonly alertService = inject(AlertService);

  documentos: DocumentoSoporte[] = [];
  archivo: File | null = null;
  cargandoArchivo = false;
  formulario: DocumentoSoporteForm = this.inicializarFormulario();
  readonly tipos: Array<{ value: TipoDocumentoSoporte; label: string }> = [
    { value: 'FACTURA', label: 'Factura' },
    { value: 'RECIBO', label: 'Recibo' },
    { value: 'CUENTA_COBRO', label: 'Cuenta de cobro' },
    { value: 'COMPROBANTE', label: 'Comprobante' },
    { value: 'OTRO', label: 'Otro' }
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['movimientoId'] || changes['origen']) && this.movimientoId) this.cargarDocumentos();
  }

  seleccionarArchivo(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.archivo = input.files?.item(0) ?? null;
  }

  cargar(): void {
    if (!this.archivo) {
      this.alertService.warning('Seleccione un archivo soporte antes de cargarlo');
      return;
    }
    this.cargandoArchivo = true;
    this.service.cargar(this.origen, this.movimientoId, this.formulario, this.archivo).subscribe({
      next: () => {
        this.alertService.success('Documento soporte cargado correctamente');
        this.formulario = this.inicializarFormulario();
        this.archivo = null;
        this.cargandoArchivo = false;
        this.cargarDocumentos();
      },
      error: () => this.cargandoArchivo = false
    });
  }

  descargar(documento: DocumentoSoporte): void {
    this.service.descargar(documento.id).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = documento.nombreArchivo;
        enlace.click();
        URL.revokeObjectURL(url);
      }
    });
  }

  eliminar(documento: DocumentoSoporte): void {
    if (!window.confirm(`¿Eliminar el soporte "${documento.nombreArchivo}"?`)) return;
    this.service.eliminar(documento.id).subscribe({
      next: () => {
        this.alertService.success('Documento soporte eliminado correctamente');
        this.cargarDocumentos();
      }
    });
  }

  formatearTamano(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  private cargarDocumentos(): void {
    this.service.listar(this.origen, this.movimientoId).subscribe({
      next: documentos => this.documentos = documentos,
      error: () => this.documentos = []
    });
  }

  private inicializarFormulario(): DocumentoSoporteForm {
    return {
      tipoDocumento: 'FACTURA',
      numeroDocumento: '',
      fechaDocumento: '',
      nombreTercero: '',
      identificacionTercero: ''
    };
  }
}
