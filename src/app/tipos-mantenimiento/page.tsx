'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TipoMantenimiento } from '../interfaces/TipoMantenimiento';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

const api = axios.create({
  baseURL: 'http://localhost:5170/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default function TiposMantenimientoPage() {
  const [tipos, setTipos] = useState<TipoMantenimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTipo, setCurrentTipo] = useState<Partial<TipoMantenimiento> | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userRoleId = Cookies.get('userRoleId');
    if (userRoleId !== '1') {
      router.push('/login');
      return;
    }
    fetchTipos();
  }, [router]);

  const fetchTipos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/TipoMantenimiento?EstaEliminado=false');
      setTipos(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los tipos de mantenimiento');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (tipo: Partial<TipoMantenimiento> | null = null) => {
    setCurrentTipo(tipo ? { ...tipo } : { nombre: '', descripcion: '', estado: true });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentTipo(null);
  };

  const handleSave = async () => {
    if (!currentTipo) return;

    try {
      if (currentTipo.idTipo) {
        // Actualizar
        await api.put(`/TipoMantenimiento/${currentTipo.idTipo}`, currentTipo);
      } else {
        // Crear
        await api.post('/TipoMantenimiento', currentTipo);
      }
      fetchTipos();
      handleCloseModal();
    } catch (err) {
      console.error('Error al guardar el tipo de mantenimiento', err);
      alert('No se pudo guardar el tipo de mantenimiento.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar este tipo de mantenimiento?')) {
      try {
        await api.delete(`/TipoMantenimiento/${id}`);
        fetchTipos();
      } catch (err) {
        console.error('Error al eliminar el tipo de mantenimiento', err);
        alert('No se pudo eliminar el tipo de mantenimiento.');
      }
    }
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error: {error}
          </div>
        </div>
    );
  }

  return (
      <div className="container mx-auto p-4 lg:p-6 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">Gestión de Tipos de Mantenimiento</h1>
          <button
              onClick={() => handleOpenModal()}
              className="bg-orange-500 px-4 py-2 bg-primary hover:bg-primary/80 text-white font-medium rounded-lg shadow-md transition-colors duration-300"
          >
            + Nuevo Tipo
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tipos.map((tipo) => (
                  <tr key={tipo.idTipo} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tipo.idTipo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tipo.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tipo.descripcion}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tipo.estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {tipo.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleOpenModal(tipo)} className="text-secondary hover:text-secondary/80">Editar</button>
                      <button onClick={() => handleDelete(tipo.idTipo)} className="text-red-600 hover:text-red-800 ml-4">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {isModalOpen && currentTipo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">{currentTipo.idTipo ? 'Editar' : 'Crear'} Tipo de Mantenimiento</h2>
              <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                <div className="mb-4">
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input
                    type="text"
                    id="nombre"
                    value={currentTipo.nombre}
                    onChange={(e) => setCurrentTipo({ ...currentTipo, nombre: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">Descripción</label>
                  <textarea
                    id="descripcion"
                    rows={3}
                    value={currentTipo.descripcion}
                    onChange={(e) => setCurrentTipo({ ...currentTipo, descripcion: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    required
                  ></textarea>
                </div>
                <div className="mb-4">
                    <label className="flex items-center">
                        <input 
                            type="checkbox" 
                            checked={currentTipo.estado}
                            onChange={(e) => setCurrentTipo({ ...currentTipo, estado: e.target.checked })}
                            className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary"
                        />
                        <span className="ml-2 text-sm text-gray-700">Activo</span>
                    </label>
                </div>
                <div className="flex justify-end space-x-4 mt-8">
                  <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400">
                    Cancelar
                  </button>
                  <button type="submit" className=" bg-orange-500 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80">
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
  );
}
