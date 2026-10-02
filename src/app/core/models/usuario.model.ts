export interface UsuarioDTO {
  id?: number;
  usuario: string;
  contrasena?: string;
  nombres?: string;
  apellidos?: string;
}

export interface AuthResponseDTO {
  token: string;
  usuario: UsuarioDTO;
  tokenExpiresAt: number;
}
