'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {Bitacora, Mantenimiento} from '../interfaces/Mantenimiento';
import { Usuario } from '../interfaces/Usuario';
import { Parqueadero } from '../interfaces/Parqueadero';
import { TipoMantenimiento } from '../interfaces/TipoMantenimiento';
import MaintenanceModal from '../components/MaintenanceModal';
import BitacoraModal from '../components/BitacoraModal';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

// Componente Calendar
import DayMantenimientosModal from '../components/DayMantenimientosModal';

// Componente Calendar
interface CalendarProps {
  mantenimientos: Mantenimiento[];
  selectedMonth: number;
  selectedYear: number;
  onDayClick: (mantenimientosForDay: Mantenimiento[]) => void;
}

const Calendar: React.FC<CalendarProps> = ({ mantenimientos, selectedMonth, selectedYear, onDayClick }) => {
  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const totalDays = daysInMonth(selectedMonth, selectedYear);
  const startDay = firstDayOfMonth(selectedMonth, selectedYear);

  const days = Array.from({ length: totalDays }, (_, i) => i + 1);
  const emptyCells = Array.from({ length: startDay }, (_, i) => i);

  const getMantenimientosForDay = (day: number) => {
    const currentDayDate = new Date(selectedYear, selectedMonth, day);
    currentDayDate.setHours(0, 0, 0, 0); // Normalize to start of the day

    return mantenimientos.filter(mantenimiento => {
      const startDate = new Date(mantenimiento.fechaInicio);
      startDate.setHours(0, 0, 0, 0); // Normalize to start of the day

      const endDate = mantenimiento.fechaFin ? new Date(mantenimiento.fechaFin) : null;
      if (endDate) endDate.setHours(0, 0, 0, 0); // Normalize to start of the day

      // Check if the current day is within the maintenance period
      return currentDayDate >= startDate && (endDate === null || currentDayDate <= endDate);
    });
  };

  const getStatusColor = (estado: string) => {
    switch(estado) {
      case 'Completado': return 'bg-green-200 text-green-800';
      case 'Pendiente': return 'bg-orange-200 text-orange-800';
      case 'Cancelado': return 'bg-red-200 text-red-800';
      default: return 'bg-blue-200 text-blue-800';
    }
  };

  return (
      <div className="grid grid-cols-7 gap-1 p-4 bg-white rounded-lg shadow-lg">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
            <div key={day} className="font-bold text-center text-gray-700 py-2 text-sm md:text-base">
              {day}
            </div>
        ))}

        {emptyCells.map((_, index) => (
            <div key={`empty-${index}`} className="border border-gray-200 p-1 h-16 md:h-24"></div>
        ))}

        {days.map(day => {
          const dayMantenimientos = getMantenimientosForDay(day);
          const isToday = new Date().getDate() === day &&
              new Date().getMonth() === selectedMonth &&
              new Date().getFullYear() === selectedYear;

          return (
              <div
                  key={day}
                  className={`border border-gray-200 p-1 h-16 md:h-24 flex flex-col cursor-pointer ${isToday ? 'bg-secondary/10' : ''}`}
                  onClick={() => onDayClick(dayMantenimientos)}
              >
            <span className={`font-bold text-xs md:text-sm ${isToday ? 'text-secondary' : 'text-gray-700'}`}>
              {day}
            </span>
                <div className="flex-grow overflow-y-auto">
                  {dayMantenimientos.map(m => (
                      <div
                          key={m.idMantenimiento}
                          className={`text-xs rounded px-1 py-0.5 mb-0.5 truncate ${getStatusColor(m.estado)}`}
                          title={m.observaciones}
                      >
                        No. {m.idMantenimiento} - {m.observaciones}
                      </div>
                  ))}
                </div>
              </div>
          );
        })}
      </div>
  );
};

// Componente Filters
interface FiltersProps {
  onFilterChange: (filters: { startDate: string; endDate: string; userId: string; month: number }) => void;
  currentFilters: { startDate: string; endDate: string; userId: string; month: number };
  users: Usuario[];
}

const Filters: React.FC<FiltersProps> = ({ onFilterChange, currentFilters, users }) => {
  const [startDate, setStartDate] = useState(currentFilters.startDate);
  const [endDate, setEndDate] = useState(currentFilters.endDate);
  const [userId, setUserId] = useState(currentFilters.userId);
  const [month, setMonth] = useState(currentFilters.month);

  useEffect(() => {
    onFilterChange({ startDate, endDate, userId, month });
  }, [startDate, endDate, userId, month, onFilterChange]);

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setUserId('');
    setMonth(new Date().getMonth());
  };

  return (
      <div className="bg-white p-4 rounded-lg shadow-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Fecha Desde</label>
            <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">Fecha Hasta</label>
            <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
            <select
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Todos</option>
              {users.map(user => (
                  <option key={user.cedula} value={user.cedula}>
                    {user.nombre} {user.apellido}
                  </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">Mes</label>
            <select
                id="month"
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>
                    {new Date(0, i).toLocaleString('es-ES', { month: 'long' })}
                  </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button
              onClick={resetFilters}
              className="px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 hover:underline"
          >
            Limpiar filtros
          </button>
        </div>
      </div>
  );
};

// Componente principal
export default function MantenimientosPage() {
  const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>([]);
  const [users, setUsers] = useState<Usuario[]>([]);
  const [parqueaderos, setParqueaderos] = useState<Parqueadero[]>([]);
  const [tiposMantenimiento, setTiposMantenimiento] = useState<TipoMantenimiento[]>([]);
  const [loading, setLoading] = useState({
    mantenimientos: true,
    users: true,
    parqueaderos: true,
    tiposMantenimiento: true,
  });
  const [error, setError] = useState({
    mantenimientos: '',
    users: '',
    parqueaderos: '',
    tiposMantenimiento: '',
  });
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    userId: '',
    month: new Date().getMonth(),
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBitacoraModalOpen, setIsBitacoraModalOpen] = useState(false);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [selectedDayMantenimientos, setSelectedDayMantenimientos] = useState<Mantenimiento[]>([]);
  const [selectedMantenimientoId, setSelectedMantenimientoId] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRoleId, setCurrentUserRoleId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userId = Cookies.get('userId');
    const userRoleId = Cookies.get('userRoleId');

    if (!userId || !userRoleId) {
      router.push('/login');
      return;
    }

    setCurrentUserId(userId);
    setCurrentUserRoleId(parseInt(userRoleId));
  }, [router]);

  const api = axios.create({
    baseURL: 'http://localhost:5170/api',
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  useEffect(() => {
    const getMantenimientos = async () => {
      if (!currentUserId) return;

      try {
        let url = '/Mantenimiento?EstaEliminado=false';

        if (currentUserRoleId !== 1) {
          url = `/Mantenimiento?Iusuario=${currentUserId}&EstaEliminado=false`;
        }

        const response = await api.get(url);
        setMantenimientos(response.data);
        setError(prev => ({...prev, mantenimientos: ''}));
      } catch (err) {
        console.error('Error al obtener mantenimientos:', err);
        setError(prev => ({...prev, mantenimientos: 'Error al cargar mantenimientos'}));
      } finally {
        setLoading(prev => ({...prev, mantenimientos: false}));
      }
    };
    getMantenimientos();
  }, [currentUserId, currentUserRoleId, api]);

  // Obtener usuarios
  useEffect(() => {
    const getUsers = async () => {
      if (currentUserRoleId !== 1) {
        setLoading(prev => ({...prev, users: false}));
        return;
      }
      try {
        const response = await api.get('/Usuarios');
        setUsers(response.data);
        setError(prev => ({...prev, users: ''}));
      } catch (err) {
        console.error('Error al obtener usuarios:', err);
        setError(prev => ({...prev, users: 'Error al cargar usuarios'}));
      } finally {
        setLoading(prev => ({...prev, users: false}));
      }
    };
    getUsers();
  }, [currentUserRoleId, api]);

  // Obtener Parqueaderos
  useEffect(() => {
    const getParqueaderos = async () => {
      try {
        const response = await api.get('/Parqueadero');
        setParqueaderos(response.data);
        setError(prev => ({ ...prev, parqueaderos: '' }));
      } catch (err) {
        console.error('Error al obtener parqueaderos:', err);
        setError(prev => ({ ...prev, parqueaderos: 'Error al cargar parqueaderos' }));
      } finally {
        setLoading(prev => ({ ...prev, parqueaderos: false }));
      }
    };
    getParqueaderos();
  }, [api]);

  // Obtener Tipos de Mantenimiento
  useEffect(() => {
    const getTiposMantenimiento = async () => {
      try {
        const response = await api.get('/TipoMantenimiento');
        setTiposMantenimiento(response.data);
        setError(prev => ({ ...prev, tiposMantenimiento: '' }));
      } catch (err) {
        console.error('Error al obtener tipos de mantenimiento:', err);
        setError(prev => ({ ...prev, tiposMantenimiento: 'Error al cargar tipos de mantenimiento' }));
      } finally {
        setLoading(prev => ({ ...prev, tiposMantenimiento: false }));
      }
    };
    getTiposMantenimiento();
  }, [api]);

  // Crear nuevo mantenimiento
  const handleAddMaintenance = async (newMaintenance: Omit<Mantenimiento, 'idMantenimiento' | 'bitacoras' | 'fechaCreacion' | 'fechaModificacion' | 'estaEliminado' | 'idInforme'>) => {
    try {
      const response = await api.post('/Mantenimiento', newMaintenance);
      setMantenimientos(prev => [...prev, response.data]);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error al crear mantenimiento:', err);
      alert('Error al crear el mantenimiento. Por favor intente nuevamente.');
    }
  };

  // Filtrar mantenimientos
  const filteredMantenimientos = mantenimientos.filter(mantenimiento => {
    const maintenanceDate = new Date(mantenimiento.fechaInicio);
    const matchesStartDate = filters.startDate ? maintenanceDate >= new Date(filters.startDate) : true;
    const matchesEndDate = filters.endDate ? maintenanceDate <= new Date(filters.endDate) : true;
    const matchesUserId = (currentUserRoleId !== 1 && currentUserId) ?
        mantenimiento.idUsuario === parseInt(currentUserId) : (filters.userId ? users.find(user => user.cedula === filters.userId)?.idRol === mantenimiento.idUsuario : true);
    const matchesMonth = maintenanceDate.getMonth() === filters.month;

    return matchesStartDate && matchesEndDate && matchesUserId && matchesMonth;
  });

  const handleAddBitacora = async (idMantenimiento: number, newBitacora: Omit<Bitacora, 'idBitacora' | 'fechaCreacion' | 'fechaModificacion' | 'estaEliminado' | 'idMantenimiento'>, imageFile: File | null) => {
    try {
      const formData = new FormData();
      formData.append('idMantenimiento', idMantenimiento.toString());
      formData.append('descripcion', newBitacora.descripcion);
      if (imageFile) {
        formData.append('imagen', imageFile);
      }

      await api.post('/Bitacora', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      await api.put(`/Mantenimiento/estado/${idMantenimiento}`, { estado: 'Completado' });

      const response = await api.get<Mantenimiento[]>(`/Mantenimiento${currentUserRoleId !== 1 ? `/usuario/${currentUserId}` : ''}`);
      setMantenimientos(response.data);
      setIsBitacoraModalOpen(false);
    } catch (err) {
      console.error('Error al adjuntar bitácora o actualizar mantenimiento:', err);
      alert('Error al adjuntar la bitácora o actualizar el mantenimiento. Por favor intente nuevamente.');
    }
  };

  if (loading.mantenimientos || loading.users || loading.parqueaderos || loading.tiposMantenimiento) {
    return (
        <div className="container mx-auto p-4 lg:p-6 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-primary"></div>
            <p className="mt-2 text-gray-700">Cargando datos...</p>
          </div>
        </div>
    );
  }

  if (error.mantenimientos && error.users) {
    return (
        <div className="container mx-auto p-4 lg:p-6 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> No se pudieron cargar los datos necesarios. Por favor recargue la página.
          </div>
        </div>
    );
  }

  return (
      <div className="container mx-auto p-4 lg:p-6 bg-gray-50 min-h-screen">
        {error.mantenimientos && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error.mantenimientos}
            </div>
        )}

        {error.users && (
            <div className="mb-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
              {error.users} - Algunas funciones pueden estar limitadas
            </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">Gestión de Mantenimientos</h1>
          {currentUserRoleId === 1 && (
              <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-orange-500 mt-4 md:mt-0 px-4 py-2 bg-primary hover:bg-primary/80 text-white font-medium rounded-lg shadow-md transition-colors duration-300"
                  disabled={!!error.users || !!error.parqueaderos || !!error.tiposMantenimiento}
              >
                + Nuevo Mantenimiento
              </button>
          )}
        </div>

        {currentUserRoleId === 1 && (
            <Filters
                onFilterChange={setFilters}
                currentFilters={filters}
                users={users}
            />
        )}

        <div className="bg-white p-4 rounded-lg shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Resumen de Mantenimientos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-100 p-4 rounded-lg">
              <h3 className="font-medium text-green-800">Completados</h3>
              <p className="text-2xl font-bold text-green-600">
                {filteredMantenimientos.filter(m => m.estado === 'Completado').length}
              </p>
            </div>
            <div className="bg-orange-100 p-4 rounded-lg">
              <h3 className="font-medium text-orange-800">Pendientes</h3>
              <p className="text-2xl font-bold text-orange-600">
                {filteredMantenimientos.filter(m => m.estado === 'Pendiente').length}
              </p>
            </div>
            <div className="bg-blue-100 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800">Total</h3>
              <p className="text-2xl font-bold text-blue-600">
                {filteredMantenimientos.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Calendario de Mantenimientos - {new Date(0, filters.month).toLocaleString('es-ES', { month: 'long' })}
          </h2>
          {error.mantenimientos ? (
              <div className="text-center py-8 text-gray-500">
                No se pueden mostrar los mantenimientos debido a un error
              </div>
          ) : (
              <Calendar
                  mantenimientos={filteredMantenimientos}
                  selectedMonth={filters.month}
                  selectedYear={new Date().getFullYear()}
                  onDayClick={(mantenimientosForDay) => {
                    setSelectedDayMantenimientos(mantenimientosForDay);
                    setIsDayModalOpen(true);
                  }}
              />
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Detalle de Mantenimientos</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 text-left text-sm md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 text-left text-sm md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th scope="col" className="px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 text-left text-sm md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parqueadero
                </th>
                <th scope="col" className="px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 text-left text-sm md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th scope="col" className="px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 text-left text-sm md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Inicio
                </th>
                <th scope="col" className="px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 text-left text-sm md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Fin
                </th>
                <th scope="col" className="px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 text-left text-sm md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 text-left text-sm md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
              {filteredMantenimientos.length > 0 ? (
                  filteredMantenimientos.map(m => (
                      <tr key={m.idMantenimiento} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-4 py-2 md:px-6 md:py-4 lg:px-8 lg:py-5 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{m.idMantenimiento}
                        </td>
                        <td className="px-4 py-2 md:px-6 md:py-4 lg:px-8 lg:py-5 whitespace-nowrap text-sm text-gray-500">
                          {users.find(u => u.idRol === m.idUsuario)?.nombre || 'N/A'}
                        </td>
                        <td className="px-4 py-2 md:px-6 md:py-4 lg:px-8 lg:py-5 whitespace-nowrap text-sm text-gray-500">
                          {parqueaderos.find(p => p.idParqueadero === m.idParqueadero)?.nombre || 'N/A'}
                        </td>
                        <td className="px-4 py-2 md:px-6 md:py-4 lg:px-8 lg:py-5 whitespace-nowrap text-sm text-gray-500">
                          {tiposMantenimiento.find(t => t.idTipo === m.idTipoMantenimiento)?.nombre || 'N/A'}
                        </td>
                        <td className="px-4 py-2 md:px-6 md:py-4 lg:px-8 lg:py-5 whitespace-nowrap text-sm text-gray-500">
                          {new Date(m.fechaInicio).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-4 py-2 md:px-6 md:py-4 lg:px-8 lg:py-5 whitespace-nowrap text-sm text-gray-500">
                          {m.fechaFin ?
                              new Date(m.fechaFin).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 'N/A'}
                        </td>
                        <td className="px-4 py-2 md:px-6 md:py-4 lg:px-8 lg:py-5 whitespace-nowrap">
                        <span className={`px-2 py-1 text-sm md:text-xs font-medium rounded-full ${
                            m.estado === 'Completado' ? 'bg-green-100 text-green-800' :
                                m.estado === 'Pendiente' ? 'bg-orange-100 text-orange-800' :
                                    'bg-red-100 text-red-800'
                        }`}>
                          {m.estado}
                        </span>
                        </td>
                        <td className="px-4 py-2 md:px-6 md:py-4 lg:px-8 lg:py-5 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                                className="px-3 py-1 bg-secondary text-white text-xs rounded-md hover:bg-secondary/80 transition-colors duration-200"
                            >
                              Editar
                            </button>
                            <button
                                className="px-3 py-1 bg-green-500 text-white text-xs rounded-md hover:bg-green-600 transition-colors duration-200"
                                onClick={() => {
                                  setSelectedMantenimientoId(m.idMantenimiento);
                                  setIsBitacoraModalOpen(true);
                                }}
                            >
                              Bitácora
                            </button>
                          </div>
                        </td>
                      </tr>
                  ))
              ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                      No se encontraron mantenimientos con los filtros aplicados
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        </div>

        <MaintenanceModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleAddMaintenance}
            users={users}
            parqueaderos={parqueaderos}
            tiposMantenimiento={tiposMantenimiento}
        />

        {selectedMantenimientoId && (
            <BitacoraModal
                isOpen={isBitacoraModalOpen}
                onClose={() => setIsBitacoraModalOpen(false)}
                idMantenimiento={selectedMantenimientoId}
                onSubmit={handleAddBitacora}
            />
        )}

        <DayMantenimientosModal
            isOpen={isDayModalOpen}
            onClose={() => setIsDayModalOpen(false)}
            mantenimientos={selectedDayMantenimientos}
            users={users}
            parqueaderos={parqueaderos}
            tiposMantenimiento={tiposMantenimiento}
        />
      </div>
  );
}