'use client';
import React, { useState, useEffect } from 'react';
import { Informe } from '../interfaces/Informe';
import { Usuario } from '../interfaces/Usuario';
import Cookies from "js-cookie";
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import {Parqueadero} from "@/app/interfaces/Parqueadero";
import {TipoMantenimiento} from "@/app/interfaces/TipoMantenimiento";
import {Mantenimiento} from "@/app/interfaces/Mantenimiento";

// Configuración de Axios
const api = axios.create({
  baseURL: 'http://localhost:5170/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

interface ApiError {
  message?: string;
}

export default function InformesPage() {
  const [informes, setInformes] = useState<Informe[]>([]);
  const [users, setUsers] = useState<Usuario[]>([]);
  const [parqueaderos, setParqueaderos] = useState<Parqueadero[]>([]);
  const [tiposMantenimiento, setTiposMantenimiento] = useState<TipoMantenimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRoleId, setCurrentUserRoleId] = useState<number | null>(null);
  const [newReportTitle, setNewReportTitle] = useState('');
  const [newReportDescription, setNewReportDescription] = useState('');
  const [newReportFile, setNewReportFile] = useState<File | null>(null);
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [reportUserId, setReportUserId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [expandedInformeId, setExpandedInformeId] = useState<number | null>(null);
  const [expandedMantenimientos, setExpandedMantenimientos] = useState<Mantenimiento[]>([]);
  const router = useRouter();

  const fetchMantenimientosForInforme = async (idInforme: number) => {
    try {
      const response = await api.get<Mantenimiento[]>(`/Mantenimiento?IdInforme=${idInforme}`);
      setExpandedMantenimientos(response.data);
    } catch (err) {
      console.error('Error al cargar mantenimientos para el informe:', err);
      setExpandedMantenimientos([]);
    }
  };

  const handleToggleExpand = (idInforme: number) => {
    if (expandedInformeId === idInforme) {
      setExpandedInformeId(null);
      setExpandedMantenimientos([]);
    } else {
      setExpandedInformeId(idInforme);
      fetchMantenimientosForInforme(idInforme);
    }
  };

  useEffect(() => {
    const userId = Cookies.get('userId') || null;
    const userRoleId = Cookies.get('userRoleId');

    if (!userId || !userRoleId) {
      router.push('/login');
      return;
    }

    setCurrentUserId(userId);
    setCurrentUserRoleId(userRoleId ? parseInt(userRoleId) : null);

    const fetchInformes = async () => {
      try {
        setLoading(true);
        setError(null);

        let url = '/InformesEncabezado';
        if (userRoleId && parseInt(userRoleId) !== 1 && userId) {
          url = `/InformesEncabezado/usuario/${userId}`;
        }

        const response = await api.get<Informe[]>(url);
        setInformes(response.data);
      } catch (err) {
        const error = err as AxiosError<ApiError>;
        setError(error.response?.data?.message || error.message || 'Error al cargar informes');
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await api.get<Usuario[]>('/Usuarios');
        const usersWithUpdatedPasswordStatus: Usuario[] = response.data.map((user: Usuario) => ({
          ...user,
          contrasenaActualizada: user.contrasenaActualizada || true, // Ensure contrasenaActualizada is always present
        }));
        setUsers(usersWithUpdatedPasswordStatus);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    const fetchParqueaderos = async () => {
      try {
        const response = await api.get<Parqueadero[]>('/Parqueadero');
        setParqueaderos(response.data);
      } catch (err) {
        console.error('Error fetching parkings:', err);
      }
    };

    const fetchTiposMantenimiento = async () => {
      try {
        const response = await api.get<TipoMantenimiento[]>('/TipoMantenimiento');
        setTiposMantenimiento(response.data);
      } catch (err) {
        console.error('Error fetching maintenance types:', err);
      }
    };

    fetchInformes();
    fetchUsers();
    fetchParqueaderos();
    fetchTiposMantenimiento();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      if (!currentUserId) {
        throw new Error('No se pudo identificar al usuario');
      }

      // Crear InformeEncabezado
      const informeResponse = await api.post('/InformesEncabezado', {
        idUsuario: parseInt(currentUserId),
        titulo: newReportTitle
      });

      const newInforme = informeResponse.data;
      const idInforme = newInforme.idInforme;

      // Actualizar mantenimientos con idInforme
      await api.put('/Mantenimiento/updateInforme', {
        idInforme: idInforme,
        startDate: reportStartDate,
        endDate: reportEndDate,
        userId: parseInt(currentUserId)
      });

      // Crear DetalleInforme si hay archivo
      if (newReportFile) {
        const formData = new FormData();
        formData.append('idInforme', idInforme.toString());
        formData.append('descripcion', newReportDescription);
        formData.append('archivo', newReportFile);

        await api.post('/DetalleInforme', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      setSubmitSuccess('Informe creado exitosamente!');
      setNewReportTitle('');
      setNewReportDescription('');
      setNewReportFile(null);
      setReportStartDate('');
      setReportEndDate('');
      setReportUserId('');

      // Actualizar lista de informes
      const response = await api.get<Informe[]>(`/InformesEncabezado/usuario/${currentUserId}`);
      setInformes(response.data);
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      setSubmitError(error.response?.data?.message || error.message || 'Error al crear el informe');
    } finally {
      setSubmitting(false);
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
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md text-center">
            <p className="font-medium">Error al cargar los informes</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
    );
  }

  return (
      <div className="container mx-auto p-4 lg:p-6 min-h-screen">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Gestión de Informes</h1>
        </div>

        {/* Formulario de creación */}
        {currentUserRoleId !== 1 && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-8 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Crear Nuevo Informe</h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Título del Informe</label>
                    <input
                        type="text"
                        id="title"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={newReportTitle}
                        onChange={(e) => setNewReportTitle(e.target.value)}
                        required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                      id="description"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={newReportDescription}
                      onChange={(e) => setNewReportDescription(e.target.value)}
                      required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="reportStartDate" className="block text-sm font-medium text-gray-700 mb-1">Fecha Desde</label>
                    <input
                        type="date"
                        id="reportStartDate"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={reportStartDate}
                        onChange={(e) => setReportStartDate(e.target.value)}
                        required
                    />
                  </div>
                  <div>
                    <label htmlFor="reportEndDate" className="block text-sm font-medium text-gray-700 mb-1">Fecha Hasta</label>
                    <input
                        type="date"
                        id="reportEndDate"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={reportEndDate}
                        onChange={(e) => setReportEndDate(e.target.value)}
                        required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">Archivo (PDF/DOCX)</label>
                  <div className="flex items-center">
                    <label className="flex flex-col items-center px-4 py-6 bg-white rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors duration-200">
                      <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                      </svg>
                      <span className="mt-2 text-sm text-gray-600">
                      {newReportFile ? newReportFile.name : 'Seleccionar archivo'}
                    </span>
                      <input
                          type="file"
                          id="file"
                          className="hidden"
                          onChange={(e) => setNewReportFile(e.target.files ? e.target.files[0] : null)}
                          accept=".pdf,.docx"
                          required
                      />
                    </label>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                      type="submit"
                      className="w-full py-2 px-4 bg-primary hover:bg-primary/90 text-white font-medium rounded-md shadow-sm transition-colors duration-200 disabled:opacity-50 flex items-center justify-center"
                      disabled={submitting}
                  >
                    {submitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creando...
                        </>
                    ) : 'Crear Informe'}
                  </button>
                </div>

                {submitError && (
                    <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                      {submitError}
                    </div>
                )}
                {submitSuccess && (
                    <div className="mt-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
                      {submitSuccess}
                    </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Listado de informes */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Listado de Informes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-2 md:px-6 md:py-3 text-left text-sm md:text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-4 py-2 md:px-6 md:py-3 text-left text-sm md:text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                <th scope="col" className="px-4 py-2 md:px-6 md:py-3 text-left text-sm md:text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                <th scope="col" className="px-4 py-2 md:px-6 md:py-3 text-left text-sm md:text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th scope="col" className="px-4 py-2 md:px-6 md:py-3 text-left text-sm md:text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
              {informes.length > 0 ? (
                  informes.map((informe) => (
                      <React.Fragment key={informe.idInforme}>
                        <tr className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-4 py-2 md:px-6 md:py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{informe.idInforme}</td>
                          <td className="px-4 py-2 md:px-6 md:py-4 whitespace-nowrap text-sm text-gray-600">
                            {users.find(u => u.idRol === informe.idUsuario)?.nombre || 'N/A'}
                          </td>
                          <td className="px-4 py-2 md:px-6 md:py-4 whitespace-nowrap text-sm text-gray-600">{informe.titulo}</td>
                          <td className="px-4 py-2 md:px-6 md:py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(informe.fechaCreacion).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="px-4 py-2 md:px-6 md:py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            informe.estado === 'Completado' ? 'bg-green-100 text-green-800' :
                                informe.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                        }`}>
                          {informe.estado}
                        </span>
                          </td>
                          <td className="px-4 py-2 md:px-6 md:py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                                onClick={() => handleToggleExpand(informe.idInforme)}
                                className="text-secondary hover:text-secondary/80"
                            >
                              {expandedInformeId === informe.idInforme ? 'Ocultar' : 'Ver'} Mantenimientos
                            </button>
                          </td>
                        </tr>
                        {expandedInformeId === informe.idInforme && (
                            <tr>
                              <td colSpan={6} className="p-4 bg-gray-50">
                                <h4 className="text-md font-semibold mb-2">Mantenimientos Asociados:</h4>
                                {expandedMantenimientos.length > 0 ? (
                                    <table className="min-w-full divide-y divide-gray-200 bg-white border border-gray-200">
                                      <thead className="bg-gray-100">
                                      <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">ID</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Usuario</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Parqueadero</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Tipo</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Fecha Inicio</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Estado</th>
                                      </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-200">
                                      {expandedMantenimientos.map(m => (
                                          <tr key={m.idMantenimiento}>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">#{m.idMantenimiento}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{users.find(u => u.idRol === m.idUsuario)?.nombre || 'N/A'}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{parqueaderos.find(p => p.idParqueadero === m.idParqueadero)?.nombre || 'N/A'}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{tiposMantenimiento.find(t => t.idTipo === m.idTipoMantenimiento)?.nombre || 'N/A'}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{new Date(m.fechaInicio).toLocaleDateString()}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{m.estado}</td>
                                          </tr>
                                      ))}
                                      </tbody>
                                    </table>
                                ) : (
                                    <p className="text-sm text-gray-500">No hay mantenimientos asociados a este informe.</p>
                                )}
                              </td>
                            </tr>
                        )}
                      </React.Fragment>
                  ))
              ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      No se encontraron informes
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
}