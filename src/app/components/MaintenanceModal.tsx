'use client';

import React, { useState } from 'react';
import { Mantenimiento } from '../interfaces/Mantenimiento';

import { Usuario } from '../interfaces/Usuario';

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newMaintenance: Omit<Mantenimiento, 'idMantenimiento' | 'bitacoras' | 'fechaCreacion' | 'fechaModificacion' | 'estaEliminado'>) => void;
  users: Usuario[];
}

const MaintenanceModal: React.FC<MaintenanceModalProps> = ({ isOpen, onClose, onSubmit, users }) => {
  const [formData, setFormData] = useState<Omit<Mantenimiento, 'idMantenimiento' | 'bitacoras' | 'fechaCreacion' | 'fechaModificacion' | 'estaEliminado'>>({
    idUsuario: 0,
    idParqueadero: 0,
    idTipoMantenimiento: 0,
    idInforme: 0,
    fechaInicio: '',
    fechaFin: '',
    observaciones: '',
    estado: 'Pendiente',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.startsWith('id') ? parseInt(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Crear Nuevo Mantenimiento</h2>
            <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="idUsuario" className="block text-sm font-medium text-gray-700">Usuario</label>
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
              <label htmlFor="idParqueadero" className="block text-sm font-medium text-gray-700">ID Parqueadero</label>
              <input
                  type="number"
                  id="idParqueadero"
                  name="idParqueadero"
                  value={formData.idParqueadero}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="idTipoMantenimiento" className="block text-sm font-medium text-gray-700">ID Tipo Mantenimiento</label>
              <input
                  type="number"
                  id="idTipoMantenimiento"
                  name="idTipoMantenimiento"
                  value={formData.idTipoMantenimiento}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="idInforme" className="block text-sm font-medium text-gray-700">ID Informe</label>
              <input
                  type="number"
                  id="idInforme"
                  name="idInforme"
                  value={formData.idInforme}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700">Fecha Inicio</label>
              <input
                  type="datetime-local"
                  id="fechaInicio"
                  name="fechaInicio"
                  value={formData.fechaInicio}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="fechaFin" className="block text-sm font-medium text-gray-700">Fecha Fin</label>
              <input
                  type="datetime-local"
                  id="fechaFin"
                  name="fechaFin"
                  value={formData.fechaFin}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700">Observaciones</label>
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
  );
};

export default MaintenanceModal;