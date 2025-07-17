import { Mantenimiento } from './Mantenimiento';

export interface DetalleInforme {
  idDetInfo: number;
  idInforme: number;
  descripcion: string;
  archivoUrl: string;
  fechaCreacion: string;
  fechaModificacion: string;
  estado: string;
}

export interface Informe {
  idInforme: number;
  idUsuario: number;
  titulo: string;
  fechaCreacion: string;
  fechaModificacion: string;
  estado: string;
  mantenimientos: Mantenimiento[];
  detalles: DetalleInforme[];
}
