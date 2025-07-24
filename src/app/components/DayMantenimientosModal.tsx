'use client';

import React, { useEffect } from 'react';
import { Mantenimiento } from '../interfaces/Mantenimiento';
import { Usuario } from '../interfaces/Usuario';
import { Parqueadero } from '../interfaces/Parqueadero';
import { TipoMantenimiento } from '../interfaces/TipoMantenimiento';

interface DayMantenimientosModalProps {
    isOpen: boolean;
    onClose: () => void;
    mantenimientos: Mantenimiento[];
    users: Usuario[];
    parqueaderos: Parqueadero[];
    tiposMantenimiento: TipoMantenimiento[];
}

const DayMantenimientosModal: React.FC<DayMantenimientosModalProps> = ({ isOpen, onClose, mantenimientos, users, parqueaderos, tiposMantenimiento }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const getUserName = (idRol: number) => {
        const user = users.find(u => u.idRol === idRol);
        return user ? `${user.nombre} ${user.apellido}` : 'N/A';
    };

    const getParqueaderoName = (idParqueadero: number) => {
        const parqueadero = parqueaderos.find(p => p.idParqueadero === idParqueadero);
        return parqueadero ? parqueadero.nombre : 'N/A';
    };

    const getTipoMantenimientoName = (idTipo: number) => {
        const tipo = tiposMantenimiento.find(t => t.idTipo === idTipo);
        return tipo ? tipo.nombre : 'N/A';
    };

    const getStatusBadge = (estado: string) => {
        const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';

        switch(estado) {
            case 'Completado':
                return `${baseClasses} bg-green-100 text-green-800`;
            case 'Pendiente':
                return `${baseClasses} bg-orange-100 text-orange-800`;
            case 'Cancelado':
                return `${baseClasses} bg-red-100 text-red-800`;
            default:
                return `${baseClasses} bg-blue-100 text-blue-800`;
        }
    };

    return (
        <>
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-200"
                onClick={onClose}
            ></div>

            <div className="fixed inset-0 flex justify-center items-center z-[51] p-4">
                <div
                    className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-gray-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-800">
                            Mantenimientos - <span className="text-primary">
                            {mantenimientos.length > 0 ? new Date(mantenimientos[0].fechaInicio).toLocaleDateString('es-ES', {
                                day: '2-digit', month: 'long', year: 'numeric'
                            }) : 'Mantenimientos del día'}
                        </span>
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                            aria-label="Cerrar modal"
                        >
                            <svg
                                className="w-6 h-6 text-gray-500 hover:text-gray-700"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {mantenimientos.length > 0 ? (
                            <ul className="space-y-4">
                                {mantenimientos.map(m => (
                                    <li
                                        key={m.idMantenimiento}
                                        className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="font-bold text-lg text-primary">
                                                Mantenimiento #{m.idMantenimiento}
                                            </h3>
                                            <span className={getStatusBadge(m.estado)}>
                                                {m.estado}
                                            </span>
                                        </div>

                                        <div className="space-y-2 text-gray-700 text-sm">
                                            <div className="flex items-center">
                                                <span className="font-semibold w-28">Usuario:</span>
                                                <p>{getUserName(m.idUsuario)}</p>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="font-semibold w-28">Parqueadero:</span>
                                                <p>{getParqueaderoName(m.idParqueadero)}</p>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="font-semibold w-28">Tipo:</span>
                                                <p>{getTipoMantenimientoName(m.idTipoMantenimiento)}</p>
                                            </div>
                                            <div className="flex items-start">
                                                <span className="font-semibold w-28">Descripción:</span>
                                                <p className="flex-1">{m.observaciones || 'No especificada'}</p>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="font-semibold w-28">Fecha Inicio:</span>
                                                <p>
                                                    {new Date(m.fechaInicio).toLocaleString('es-ES', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                            {m.fechaFin && (
                                                <div className="flex items-center">
                                                    <span className="font-semibold w-28">Fecha Fin:</span>
                                                    <p>
                                                        {new Date(m.fechaFin).toLocaleString('es-ES', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-8">
                                <svg
                                    className="mx-auto h-12 w-12 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <h3 className="mt-3 text-lg font-medium text-gray-900">
                                    No hay mantenimientos
                                </h3>
                                <p className="mt-1 text-gray-500">
                                    No se encontraron mantenimientos programados para este día.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DayMantenimientosModal;