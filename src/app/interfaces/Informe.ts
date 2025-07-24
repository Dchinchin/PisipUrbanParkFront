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

export interface DetalleInforme {
  idDetalleInforme: number;
  idInforme: number;
  descripcion: string;
  archivoUrl: string;
  estaEliminado: boolean;
  fechaCreacion: string;
  fechaModificacion: string;
}

export interface Informe {
  idInforme: number;
  idUsuario: number;
  titulo: string;
  estado: string;
  fechaCreacion: string;
  detalles: DetalleInforme[];
  estaEliminado: boolean;
}
