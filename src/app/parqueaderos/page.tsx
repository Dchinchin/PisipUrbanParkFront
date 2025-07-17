'use client';

import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { Parqueadero } from '../interfaces/Parqueadero';
import ParqueaderoModal from '../components/ParqueaderoModal';
import { useRouter } from "next/navigation";
import Cookies from 'js-cookie';

// Configuración de Axios con tipos
const api = axios.create({
  baseURL: 'http://localhost:5170/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Tipo para el error de la API
interface ApiError {
  message?: string;
}

export default function ParqueaderosPage() {
  const [parqueaderos, setParqueaderos] = useState<Parqueadero[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentParqueadero, setCurrentParqueadero] = useState<Parqueadero | undefined>(undefined);
  const [currentUserRoleId, setCurrentUserRoleId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userRoleId = Cookies.get('userRoleId');
    if (!userRoleId || parseInt(userRoleId) !== 1) {
      router.push('/');
      return;
    }
    setCurrentUserRoleId(parseInt(userRoleId));
    fetchParqueaderos();
  }, [router]);

  const fetchParqueaderos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<Parqueadero[]>('/Parqueadero?EstaEliminado=false');
      setParqueaderos(response.data);
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      setError(error.response?.data?.message || error.message || 'Error al cargar parqueaderos');
      console.error('Error fetching parqueaderos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este parqueadero?')) {
      return;
    }
    try {
      await api.delete(`/Parqueadero/${id}`);
      alert('Parqueadero eliminado exitosamente.');
      fetchParqueaderos();
      router.refresh();
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      alert(`Error al eliminar parqueadero: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleEdit = (parqueadero: Parqueadero) => {
    setCurrentParqueadero(parqueadero);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setCurrentParqueadero(undefined);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (parqueadero: Parqueadero) => {
    try {
      if (parqueadero.idParqueadero) {
        await api.put<Parqueadero>(`/Parqueadero/${parqueadero.idParqueadero}`, parqueadero);
        alert('Parqueadero actualizado exitosamente.');
      } else {
        const { idParqueadero, fechaCreacion, fechaModificacion, ...newParqueadero } = parqueadero;
        await api.post<Parqueadero>('/Parqueadero', newParqueadero);
        alert('Parqueadero creado exitosamente.');
      }
      setIsModalOpen(false);
      fetchParqueaderos();
      router.refresh();
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">Gestión de Parqueaderos</h1>
          <button
              onClick={handleCreate}
              className="mt-4 md:mt-0 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg shadow-md transition-colors duration-300"
              disabled={currentUserRoleId !== 1}
          >
            + Crear Parqueadero
          </button>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-lg">
          {parqueaderos.length === 0 ? (
              <p className="text-center text-gray-600">No hay parqueaderos registrados.</p>
          ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dirección
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                  {parqueaderos.map((parqueadero) => (
                      <tr key={parqueadero.idParqueadero}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {parqueadero.idParqueadero}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {parqueadero.nombre}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {parqueadero.direccion}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs ${parqueadero.estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {parqueadero.estado ? 'Activo' : 'Inactivo'}
                      </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                              onClick={() => handleEdit(parqueadero)}
                              className="text-indigo-600 hover:text-indigo-900 hover:underline"
                              disabled={currentUserRoleId !== 1}
                          >
                            Editar
                          </button>
                          <button
                              onClick={() => handleDelete(parqueadero.idParqueadero)}
                              className="text-red-600 hover:text-red-900 hover:underline"
                              disabled={currentUserRoleId !== 1}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
          )}
        </div>

        <ParqueaderoModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleModalSubmit}
            parqueadero={currentParqueadero}
        />
      </div>
  );
}