'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Usuario } from '../interfaces/Usuario';
import UserModal from '../components/UserModal';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export default function PersonalPage() {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Usuario | undefined>(undefined);
  const [currentUserRoleId, setCurrentUserRoleId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userRoleId = Cookies.get('userRoleId');
    if (!userRoleId || parseInt(userRoleId) !== 1) {
      router.push('/');
      return;
    }
    setCurrentUserRoleId(parseInt(userRoleId));
    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get<Usuario[]>('http://localhost:5170/api/Usuarios?EstaEliminado=false');
      setUsers(response.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (idRol: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      return;
    }
    try {
      await axios.delete(`http://localhost:5170/api/Usuarios/${idRol}`);
      alert('Usuario eliminado exitosamente.');
      fetchUsers(); // Recargar la lista
    } catch (err: any) {
      alert(`Error al eliminar usuario: ${err.message}`);
    }
  };

  const handleEdit = (user: Usuario) => {
    setCurrentUser(user);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setCurrentUser(undefined);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (user: Usuario) => {
    try {
      if (user.cedula) {
        // Update existing user
        await axios.put(`http://localhost:5170/api/Usuarios/${user.cedula}`, user);
      } else {
        // Create new user
        await axios.post('http://localhost:5170/api/Usuarios', user);
      }
      alert(`Usuario ${user.cedula ? 'actualizado' : 'creado'} exitosamente.`);
      setIsModalOpen(false);
      fetchUsers(); // Reload the list
    } catch (err: any) {
      alert(`Error al ${user.cedula ? 'actualizar' : 'crear'} usuario: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando usuarios...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4 lg:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">Gestión de Personal</h1>
        <button
          onClick={handleCreate}
          className="mt-4 md:mt-0 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg shadow-md transition-colors duration-300"
          disabled={currentUserRoleId !== 1}
        >
          + Crear Usuario
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-lg">
        {users.length === 0 ? (
          <p className="text-center text-gray-600">No hay usuarios registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-2 md:px-6 md:py-3 text-left text-sm md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cédula
                  </th>
                  <th scope="col" className="px-4 py-2 md:px-6 md:py-3 text-left text-sm md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th scope="col" className="px-4 py-2 md:px-6 md:py-3 text-left text-sm md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Apellido
                  </th>
                  <th scope="col" className="px-4 py-2 md:px-6 md:py-3 text-left text-sm md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Correo
                  </th>
                  <th scope="col" className="px-4 py-2 md:px-6 md:py-3 text-left text-sm md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol ID
                  </th>
                  <th scope="col" className="px-4 py-2 md:px-6 md:py-3 text-left text-sm md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.cedula}>
                    <td className="px-4 py-2 md:px-6 md:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.cedula}
                    </td>
                    <td className="px-4 py-2 md:px-6 md:py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.nombre}
                    </td>
                    <td className="px-4 py-2 md:px-6 md:py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.apellido}
                    </td>
                    <td className="px-4 py-2 md:px-6 md:py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.correo}
                    </td>
                    <td className="px-4 py-2 md:px-6 md:py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.idRol}
                    </td>
                    <td className="px-4 py-2 md:px-6 md:py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                        disabled={currentUserRoleId !== 1}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(user.idRol)}
                        className="text-red-600 hover:text-red-900"
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

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        user={currentUser}
      />
    </div>
  );
}