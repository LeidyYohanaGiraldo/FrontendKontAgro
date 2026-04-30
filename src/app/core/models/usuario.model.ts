
export interface UsuarioDTO {
  id?: number;          // El '?' significa que puede ser nulo (como un Long en Java)
  usuario: string;      // En JS/TS se usa 'string' en minúscula
  contrasena?: string; 
  nombre?: string;
}

export interface AuthResponseDTO {
  token: string;
  usuario: UsuarioDTO;  // Aquí se usa la interfaz de arriba como tipo
}