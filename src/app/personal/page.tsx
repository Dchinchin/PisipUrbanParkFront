'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Usuario } from '../interfaces/Usuario';
import { Rol } from '../interfaces/Rol';
import UserModal from '../components/UserModal';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';

interface ApiError {
  message?: string;
}

export default function PersonalPage() {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
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
    fetchRoles();
  }, [router]);

  const fetchRoles = async () => {
    try {
      const response = await axios.get<Rol[]>('http://localhost:5170/api/Roles');
      setRoles(response.data);
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      console.error('Error fetching roles:', error);
      setError(error.response?.data?.message || error.message || 'Error al cargar roles');
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get<Usuario[]>('http://localhost:5170/api/Usuarios?EstaEliminado=false');
      const usersWithUpdatedPasswordStatus: Usuario[] = response.data.map((user: Usuario) => ({
        ...user,
        contrasenaActualizada: true, // Assuming existing users have updated passwords
      }));
      setUsers(usersWithUpdatedPasswordStatus);
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      setError(error.response?.data?.message || error.message || 'Error al cargar usuarios');
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
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      setError(error.response?.data?.message || error.message || 'Error al cargar usuarios');
    }
  };

  const handleEdit = (user: Usuario) => {
    const userWithUpdatedPassword: Usuario = { ...user, contrasenaActualizada: user.contrasenaActualizada || true };
    setCurrentUser(userWithUpdatedPassword);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setCurrentUser(undefined);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (user: Usuario) => {
    try {
      if (currentUser) {
        // Update existing user
        const userToUpdate: Partial<Usuario> = { ...user, contrasenaActualizada: user.contrasenaActualizada || true };
        if (userToUpdate.contrasena === '') {
          delete userToUpdate.contrasena;
        }
        await axios.put(`http://localhost:5170/api/Usuarios/${user.idRol}`, userToUpdate);
      } else {
        // Create new user
        console.log('User object being sent to API:', user);
        await axios.post('/Usuarios', user);
      }
      alert(`Usuario ${currentUser ? 'actualizado' : 'creado'} exitosamente.`);
      setIsModalOpen(false);
      fetchUsers(); // Reload the list
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      alert(`Error al ${currentUser ? 'actualizar' : 'crear'} usuario: ${error.response?.data?.message || error.message}`);
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
                      {roles.find(role => role.idRol === user.idRol)?.nombreRol || 'N/A'}
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