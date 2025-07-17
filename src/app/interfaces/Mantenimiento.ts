export interface Bitacora {
  idBitacora: number;
  idMantenimiento: number;
  fechaHora: string;
  descripcion: string;
  imagenUrl: string;
  estaEliminado: boolean;
  fechaCreacion: string;
  fechaModificacion: string;
}

export interface Mantenimiento {
  idMantenimiento: number;
  idUsuario: number;
  idParqueadero: number;
  idTipoMantenimiento: number;
  idInforme: number;
  fechaInicio: string;
  fechaCreacion: string;
  fechaFin: string;
  observaciones: string;
  estado: string;
  estaEliminado: boolean;
  fechaModificacion: string;
  bitacoras: Bitacora[];
}
