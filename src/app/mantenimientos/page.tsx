'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mantenimiento } from '../interfaces/Mantenimiento';
import { Usuario } from '../interfaces/Usuario';
import MaintenanceModal from '../components/MaintenanceModal';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

// Componente Calendar
interface CalendarProps {
  mantenimientos: Mantenimiento[];
  selectedMonth: number;
  selectedYear: number;
}

const Calendar: React.FC<CalendarProps> = ({ mantenimientos, selectedMonth, selectedYear }) => {
  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const totalDays = daysInMonth(selectedMonth, selectedYear);
  const startDay = firstDayOfMonth(selectedMonth, selectedYear);

  const days = Array.from({ length: totalDays }, (_, i) => i + 1);
  const emptyCells = Array.from({ length: startDay }, (_, i) => i);

  const getMantenimientosForDay = (day: number) => {
    const date = new Date(selectedYear, selectedMonth, day);
    return mantenimientos.filter(mantenimiento => {
      const maintenanceDate = new Date(mantenimiento.fechaInicio);
      return maintenanceDate.getFullYear() === selectedYear &&
          maintenanceDate.getMonth() === selectedMonth &&
          maintenanceDate.getDate() === day;
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
                  className={`border border-gray-200 p-1 h-16 md:h-24 flex flex-col ${isToday ? 'bg-blue-50' : ''}`}
              >
            <span className={`font-bold text-xs md:text-sm ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
              {day}
            </span>
                <div className="flex-grow overflow-y-auto">
                  {dayMantenimientos.map(m => (
                      <div
                          key={m.idMantenimiento}
                          className={`text-xs rounded px-1 py-0.5 mb-0.5 truncate ${getStatusColor(m.estado)}`}
                          title={m.observaciones}
                      >
                        {m.observaciones}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">Fecha Hasta</label>
            <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
            <select
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
              className="px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-800 hover:underline"
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
  const [loading, setLoading] = useState({
    mantenimientos: true,
    users: true
  });
  const [error, setError] = useState({
    mantenimientos: '',
    users: ''
  });
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    userId: '',
    month: new Date().getMonth(),
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  // Configuración base de Axios
  const api = axios.create({
    baseURL: 'http://localhost:5170/api',
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Obtener mantenimientos
  useEffect(() => {
    const getMantenimientos = async () => {
      if (!currentUserId) return;

      try {
        let url = '/Mantenimiento';

        if (currentUserRoleId !== 1) {
          url = `/Mantenimiento/usuario/${currentUserId}`;
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
  }, [currentUserId, currentUserRoleId]);

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
  }, [currentUserRoleId]);

  // Crear nuevo mantenimiento
  const handleAddMaintenance = async (newMaintenance: Omit<Mantenimiento, 'idMantenimiento' | 'bitacoras' | 'fechaCreacion' | 'fechaModificacion' | 'estaEliminado'>) => {
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

  if (loading.mantenimientos || loading.users) {
    return (
        <div className="container mx-auto p-4 lg:p-6 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-orange-500"></div>
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
                className="mt-4 md:mt-0 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg shadow-md transition-colors duration-300"
                disabled={!!error.users}
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
              />
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow-lg">
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

        <MaintenanceModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleAddMaintenance}
            users={users}
        />
      </div>
  );
}