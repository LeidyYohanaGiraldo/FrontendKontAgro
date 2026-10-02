export type TipoDocumentoSoporte = 'FACTURA' | 'RECIBO' | 'CUENTA_COBRO' | 'COMPROBANTE' | 'OTRO';

export interface DocumentoSoporte {
  id: number;
  origen: 'INGRESO' | 'EGRESO';
  idMovimiento: number;
  tipoDocumento: TipoDocumentoSoporte;
  numeroDocumento?: string | null;
  fechaDocumento?: string | null;
  nombreTercero?: string | null;
  identificacionTercero?: string | null;
  nombreArchivo: string;
  tipoMime: string;
  tamanoBytes: number;
  fechaCarga: string;
}

export interface DocumentoSoporteForm {
  tipoDocumento: TipoDocumentoSoporte;
  numeroDocumento: string;
  fechaDocumento: string;
  nombreTercero: string;
  identificacionTercero: string;
}
