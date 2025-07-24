'use client';

import React, { useState } from 'react';
import { Bitacora } from '../interfaces/Mantenimiento';

interface BitacoraModalProps {
  isOpen: boolean;
  onClose: () => void;
  idMantenimiento: number;
  onSubmit: (idMantenimiento: number, newBitacora: Omit<Bitacora, 'idBitacora' | 'fechaCreacion' | 'fechaModificacion' | 'estaEliminado' | 'idMantenimiento'>, imageFile: File | null) => void;
}

const BitacoraModal: React.FC<BitacoraModalProps> = ({ isOpen, onClose, idMantenimiento, onSubmit }) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  const [descripcion, setDescripcion] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(idMantenimiento, { descripcion, imagenUrl: '', fechaHora: new Date().toISOString() }, imageFile);
    setDescripcion('');
    setImageFile(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
      <>
        {/* Fondo oscuro semitransparente - SOLO este tiene opacidad */}
        <div className="fixed inset-0 bg-black opacity-70 z-60"></div>

        {/* Contenedor del modal - NO tiene opacidad */}
        <div className="fixed inset-0 flex justify-center items-center z-70">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Adjuntar Bitácora</h2>
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
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                    id="descripcion"
                    name="descripcion"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    required
                ></textarea>
              </div>
              <div className="mb-4">
                <label htmlFor="imagen" className="block text-sm font-medium text-gray-700">Imagen (Opcional)</label>
                <input
                    type="file"
                    id="imagen"
                    name="imagen"
                    onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-secondary file:text-white hover:file:bg-secondary/80"
                    accept="image/*"
                />
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
                    className="bg-orange-500 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors duration-300"
                >
                  Adjuntar
                </button>
              </div>
            </form>
          </div>
        </div>
      </>
  );
};

export default BitacoraModal;