"use client";

import React, { useState, useEffect } from 'react';
import { Parqueadero } from '../interfaces/Parqueadero';

interface ParqueaderoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (parqueadero: Parqueadero) => void;
  parqueadero?: Parqueadero; // Optional, for editing
}

const ParqueaderoModal: React.FC<ParqueaderoModalProps> = ({ isOpen, onClose, onSubmit, parqueadero }) => {
  const [formData, setFormData] = useState<Parqueadero>({
    idParqueadero: 0,
    nombre: '',
    direccion: '',
    fechaCreacion: '',
    fechaModificacion: '',
    estado: true,
  });

  useEffect(() => {
    if (parqueadero) {
      setFormData(parqueadero);
    } else {
      setFormData({
        idParqueadero: 0,
        nombre: '',
        direccion: '',
        fechaCreacion: '',
        fechaModificacion: '',
        estado: true,
      });
    }
  }, [parqueadero, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{parqueadero ? 'Editar Parqueadero' : 'Crear Nuevo Parqueadero'}</h2>
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
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">Dirección</label>
            <textarea
              id="direccion"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              required
            ></textarea>
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
              {parqueadero ? 'Guardar Cambios' : 'Crear Parqueadero'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ParqueaderoModal;
