"use client";

import React, { useState, useEffect } from 'react';
import { Usuario } from '../interfaces/Usuario';
import { Rol } from '../interfaces/Rol';
import axios from 'axios';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (user: Usuario) => void;
  user?: Usuario; // Optional, for editing
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSubmit, user }) => {
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
  const [formData, setFormData] = useState<Usuario>({
    idRol: 0,
    nombre: '',
    apellido: '',
    correo: '',
    cedula: '',
    contrasena: '',
  });
  const [roles, setRoles] = useState<Rol[]>([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get<Rol[]>('http://localhost:5170/api/Roles');
        setRoles(response.data);
      } catch (err) {
        console.error('Error fetching roles:', err);
      }
    };
    fetchRoles();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        ...user,
        contrasena: user.contrasena || '', // Ensure contrasena is always a string
      });
    } else {
      setFormData({
        idRol: 0,
        nombre: '',
        apellido: '',
        correo: '',
        cedula: '',
        contrasena: '',
      });
    }
  }, [user, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'idRol' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
      <>
        <div className="fixed inset-0 bg-black opacity-70 z-60"></div>

    <div className="fixed inset-0 flex justify-center items-center z-70">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{user ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h2>
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
            <label htmlFor="cedula" className="block text-sm font-medium text-gray-700">Cédula</label>
            <input
              type="text"
              id="cedula"
              name="cedula"
              value={formData.cedula}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              required
              disabled={!!user} // Disable if editing existing user
            />
          </div>
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
            <label htmlFor="apellido" className="block text-sm font-medium text-gray-700">Apellido</label>
            <input
              type="text"
              id="apellido"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="correo" className="block text-sm font-medium text-gray-700">Correo</label>
            <input
              type="email"
              id="correo"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              id="contrasena"
              name="contrasena"
              value={formData.contrasena}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              required={!user}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="idRol" className="block text-sm font-medium text-gray-700">Rol</label>
            <select
              id="idRol"
              name="idRol"
              value={formData.idRol}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              required
            >
              <option value="">Seleccione un rol</option>
              {roles.map(role => (
                <option key={role.idRol} value={role.idRol}>
                  {role.nombreRol}
                </option>
              ))}
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
              {user ? 'Guardar Cambios' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
      </>
  );
};

export default UserModal;
