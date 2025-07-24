'use client';

import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {Mantenimiento} from '../interfaces/Mantenimiento';
import {Usuario} from '../interfaces/Usuario';
import {Parqueadero} from '../interfaces/Parqueadero';
import {TipoMantenimiento} from '../interfaces/TipoMantenimiento';

interface MaintenanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (newMaintenance: Omit<Mantenimiento, 'idMantenimiento' | 'bitacoras' | 'fechaCreacion' | 'fechaModificacion' | 'estaEliminado' | 'idInforme'>) => void;
    users: Usuario[];
    parqueaderos: Parqueadero[];
    tiposMantenimiento: TipoMantenimiento[];
}

const MaintenanceModal: React.FC<MaintenanceModalProps> = ({
                                                               isOpen,
                                                               onClose,
                                                               onSubmit,
                                                               users,
                                                               parqueaderos,
                                                               tiposMantenimiento
                                                           }) => {
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
    const [formData, setFormData] = useState<Omit<Mantenimiento, 'idMantenimiento' | 'bitacoras' | 'fechaCreacion' | 'fechaModificacion' | 'estaEliminado' | 'idInforme'>>({
        idUsuario: 0,
        idParqueadero: 0,
        idTipoMantenimiento: 0,
        fechaInicio: '',
        fechaFin: '',
        observaciones: '',
        estado: 'Pendiente',
    });
    const [errors, setErrors] = useState({
        fechaInicio: '',
        fechaFin: '',
    });

    const getLocalDatetimeString = (date: Date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name.startsWith('id') ? parseInt(value) : value,
        }));
        setErrors(prev => ({ ...prev, [name]: '' })); // Clear error when input changes
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors = { fechaInicio: '', fechaFin: '' };
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const startDate = new Date(formData.fechaInicio);
        const endDate = new Date(formData.fechaFin);

        // Validate fechaInicio
        if (startDate < now) {
            newErrors.fechaInicio = 'La fecha de inicio no puede ser menor a la actual.';
        }

        // Validate fechaFin
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        oneYearFromNow.setHours(23, 59, 59, 999); // End of the day for one year from now

        if (endDate > oneYearFromNow) {
            newErrors.fechaFin = 'La fecha de fin no puede ser mayor a 1 año de la fecha actual.';
        }

        if (startDate > endDate) {
            newErrors.fechaFin = 'La fecha de fin no puede ser menor a la fecha de inicio.';
        }

        setErrors(newErrors);

        if (newErrors.fechaInicio || newErrors.fechaFin) {
            return; // Prevent form submission if there are errors
        }

        onSubmit(formData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Fondo oscuro semitransparente */}
            <div className="fixed inset-0 bg-black opacity-70 z-50"></div>

            {/* Contenedor del modal */}
            <div className="fixed inset-0 flex justify-center items-center z-51">
                <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Crear Nuevo Mantenimiento</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="idUsuario"
                                   className="block text-sm font-medium text-gray-700">Usuario</label>
                            <select
                                id="idUsuario"
                                name="idUsuario"
                                value={formData.idUsuario}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                required
                            >
                                <option value="">Seleccione un usuario</option>
                                {users.map(user => (
                                    <option key={user.cedula} value={user.idRol}>
                                        {user.nombre} {user.apellido}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="idParqueadero"
                                   className="block text-sm font-medium text-gray-700">Parqueadero</label>
                            <select
                                id="idParqueadero"
                                name="idParqueadero"
                                value={formData.idParqueadero}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                required
                            >
                                <option value="">Seleccione un parqueadero</option>
                                {parqueaderos.map(p => (
                                    <option key={p.idParqueadero} value={p.idParqueadero}>
                                        {p.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="idTipoMantenimiento" className="block text-sm font-medium text-gray-700">Tipo
                                Mantenimiento</label>
                            <select
                                id="idTipoMantenimiento"
                                name="idTipoMantenimiento"
                                value={formData.idTipoMantenimiento}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                required
                            >
                                <option value="">Seleccione un tipo</option>
                                {tiposMantenimiento.map(t => (
                                    <option key={t.idTipo} value={t.idTipo}>
                                        {t.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700">Fecha
                                Inicio</label>
                            <input
                                type="datetime-local"
                                id="fechaInicio"
                                name="fechaInicio"
                                value={formData.fechaInicio}
                                onChange={handleChange}
                                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none ${errors.fechaInicio ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'}`}
                                required
                                min={getLocalDatetimeString(new Date())}
                            />
                            {errors.fechaInicio && <p className="text-red-500 text-xs mt-1">{errors.fechaInicio}</p>}
                        </div>
                        <div className="mb-4">
                            <label htmlFor="fechaFin" className="block text-sm font-medium text-gray-700">Fecha
                                Fin</label>
                            <input
                                type="datetime-local"
                                id="fechaFin"
                                name="fechaFin"
                                value={formData.fechaFin}
                                onChange={handleChange}
                                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none ${errors.fechaFin ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'}`}
                                required
                                min={formData.fechaInicio}
                                max={(() => {
                                    const oneYearFromNow = new Date();
                                    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
                                    return oneYearFromNow.toISOString().slice(0, 16);
                                })()}
                                disabled={!formData.fechaInicio}
                            />
                            {errors.fechaFin && <p className="text-red-500 text-xs mt-1">{errors.fechaFin}</p>}
                        </div>
                        <div className="mb-4">
                            <label htmlFor="observaciones"
                                   className="block text-sm font-medium text-gray-700">Observaciones</label>
                            <textarea
                                id="observaciones"
                                name="observaciones"
                                value={formData.observaciones}
                                onChange={handleChange}
                                rows={3}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                required
                            ></textarea>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="estado" className="block text-sm font-medium text-gray-700">Estado</label>
                            <select
                                id="estado"
                                name="estado"
                                value={formData.estado}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                required
                            >
                                <option value="Pendiente">Pendiente</option>
                                <option value="Completado">Completado</option>
                                <option value="Cancelado">Cancelado</option>
                            </select>
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-300"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors duration-300"
                            >
                                Crear Mantenimiento
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default MaintenanceModal;
