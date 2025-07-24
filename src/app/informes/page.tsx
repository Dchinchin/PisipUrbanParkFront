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
  const [expandedBitacoraId, setExpandedBitacoraId] = useState<number | null>(null);
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

  const handleToggleBitacoras = (idMantenimiento: number) => {
    setExpandedBitacoraId(prevId => (prevId === idMantenimiento ? null : idMantenimiento));
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

        let url = '/InformesEncabezado?EstaEliminado=false';
        if (userRoleId && parseInt(userRoleId) !== 1 && userId) {
          url = `/InformesEncabezado?IdUsuario=${userId}&EstaEliminado=false`;
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
          contrasenaActualizada: user.contrasenaActualizada || true,
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

      const informeResponse = await api.post('/InformesEncabezado', {
        idUsuario: parseInt(currentUserId),
        titulo: newReportTitle,
        estado: 'Generado'
      });

      const newInforme = informeResponse.data;
      const idInforme = newInforme.idInforme;

      const fechaDesdeISO = new Date(reportStartDate).toISOString();
      const fechaHastaISO = new Date(reportEndDate).toISOString();

      const mantenimientosResponse = await api.get<Mantenimiento[]>(`/Mantenimiento?IdUsuario=${currentUserId}&FechaDesde=${fechaDesdeISO}&FechaHasta=${fechaHastaISO}&Estado=Completado`);
      const mantenimientosParaAsociar = mantenimientosResponse.data;

      if (mantenimientosParaAsociar.length > 0) {
        const updatePromises = mantenimientosParaAsociar.map(m =>
            api.put(`/Mantenimiento/${m.idMantenimiento}`, { ...m, idInforme: idInforme })
        );
        await Promise.all(updatePromises);
      } else {
        console.warn("No se encontraron mantenimientos completados en el rango de fechas para asociar al informe.");
      }

      if (newReportFile) {
        const formData = new FormData();
        formData.append('idInforme', idInforme.toString());
        formData.append('descripcion', newReportDescription);
        formData.append('archivoFile', newReportFile);

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

      const response = await api.get<Informe[]>(`/InformesEncabezado?IdUsuario=${currentUserId}`);
      setInformes(response.data);
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      setSubmitError(error.response?.data?.message || error.message || 'Error al crear el informe');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = async (fileUrl: string, titulo: string) => {
    try {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      console.error('Error al descargar el informe:', err);
      alert('Error al descargar el informe. Por favor intente nuevamente.');
    }
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
            <p className="mt-4 text-lg font-medium text-gray-700">Cargando informes...</p>
          </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="max-w-md w-full bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-center text-red-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-center text-gray-800 mb-2">Error al cargar los informes</h2>
            <p className="text-gray-600 text-center">{error}</p>
            <button
                onClick={() => window.location.reload()}
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
            >
              Intentar nuevamente
            </button>
          </div>
        </div>
    );
  }

  return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Informes</h1>
          <p className="mt-2 text-gray-600">Crea y administra los informes de mantenimiento</p>
        </div>

        {/* Formulario de creación */}
        {currentUserRoleId !== 1 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                <h2 className="text-xl font-semibold text-white">Crear Nuevo Informe</h2>
              </div>
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">Título del Informe *</label>
                      <input
                          type="text"
                          id="title"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                          value={newReportTitle}
                          onChange={(e) => setNewReportTitle(e.target.value)}
                          required
                          placeholder="Ej: Informe mensual de mantenimiento"
                      />
                    </div>
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Descripción *</label>
                      <textarea
                          id="description"
                          rows={3}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                          value={newReportDescription}
                          onChange={(e) => setNewReportDescription(e.target.value)}
                          required
                          placeholder="Descripción detallada del informe"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="reportStartDate" className="block text-sm font-medium text-gray-700 mb-2">Fecha Desde *</label>
                      <div className="relative">
                        <input
                            type="date"
                            id="reportStartDate"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                            value={reportStartDate}
                            onChange={(e) => {
                              setReportStartDate(e.target.value);
                              if (reportEndDate && new Date(e.target.value) > new Date(reportEndDate)) {
                                setReportEndDate('');
                              }
                            }}
                            required
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="reportEndDate" className="block text-sm font-medium text-gray-700 mb-2">Fecha Hasta *</label>
                      <div className="relative">
                        <input
                            type="date"
                            id="reportEndDate"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 disabled:bg-gray-100"
                            value={reportEndDate}
                            onChange={(e) => setReportEndDate(e.target.value)}
                            required
                            disabled={!reportStartDate}
                            min={reportStartDate}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Archivo Adjunto (PDF/DOCX) *</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl">
                      <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label htmlFor="file" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                            <span>Subir un archivo</span>
                            <input
                                type="file"
                                id="file"
                                className="sr-only"
                                onChange={(e) => setNewReportFile(e.target.files ? e.target.files[0] : null)}
                                accept=".pdf,.docx"
                                required
                            />
                          </label>
                          <p className="pl-1">o arrastrar y soltar</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          {newReportFile ? newReportFile.name : 'PDF o DOCX de hasta 10MB'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                        type="submit"
                        className="cursor-pointer w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-medium rounded-lg shadow-md transition duration-200 disabled:opacity-70 flex items-center justify-center"
                        disabled={submitting}
                    >
                      {submitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Procesando...
                          </>
                      ) : (
                          <>
                            <svg className="-ml-1 mr-3 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z" clipRule="evenodd" />
                            </svg>
                            Generar Informe
                          </>
                      )}
                    </button>
                  </div>

                  {submitError && (
                      <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-red-700">{submitError}</p>
                          </div>
                        </div>
                      </div>
                  )}
                  {submitSuccess && (
                      <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-green-700">{submitSuccess}</p>
                          </div>
                        </div>
                      </div>
                  )}
                </form>
              </div>
            </div>
        )}

        {/* Listado de informes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <h2 className="text-xl font-semibold text-gray-800">Listado de Informes</h2>
              <div className="mt-2 sm:mt-0">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {informes.length} {informes.length === 1 ? 'informe' : 'informes'}
              </span>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
              {informes.length > 0 ? (
                  informes.sort((a, b) => b.idInforme - a.idInforme).map((informe) => (
                      <React.Fragment key={informe.idInforme}>
                        <tr className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{informe.idInforme}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {users.find(u => u.idUsuario === informe.idUsuario)?.nombre || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600">{informe.titulo}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(informe.fechaCreacion).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            informe.estado === 'Completado' ? 'bg-green-100 text-green-800' :
                                informe.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                        }`}>
                          {informe.estado}
                        </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                                onClick={() => informe.detalles && informe.detalles.length > 0 && informe.detalles[0].archivoUrl ? handleDownload(informe.detalles[0].archivoUrl, informe.titulo) : alert('No hay archivo disponible para descargar')}
                                className="text-blue-600 hover:text-blue-900"
                                disabled={!(informe.detalles && informe.detalles.length > 0 && informe.detalles[0].archivoUrl)}
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </button>
                            <button
                                onClick={() => handleToggleExpand(informe.idInforme)}
                                className="text-gray-600 hover:text-gray-900"
                            >
                              {expandedInformeId === informe.idInforme ? (
                                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                                  </svg>
                              ) : (
                                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                  </svg>
                              )}
                            </button>
                          </td>
                        </tr>
                        {expandedInformeId === informe.idInforme && (
                            <tr>
                              <td colSpan={6} className="px-6 py-4 bg-gray-50">
                                <div className="bg-white rounded-lg shadow-xs border border-gray-200 overflow-hidden">
                                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                    <h4 className="text-md font-semibold text-gray-700">Mantenimientos Asociados</h4>
                                  </div>
                                  {expandedMantenimientos.length > 0 ? (
                                      <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                          <thead className="bg-gray-100">
                                          <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parqueadero</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Inicio</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bitácoras</th>
                                          </tr>
                                          </thead>
                                          <tbody className="divide-y divide-gray-200">
                                          {expandedMantenimientos.map(m => (
                                              <React.Fragment key={m.idMantenimiento}>
                                                <tr>
                                                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">#{m.idMantenimiento}</td>
                                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{users.find(u => u.idUsuario === m.idUsuario)?.nombre || 'N/A'}</td>
                                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{parqueaderos.find(p => p.idParqueadero === m.idParqueadero)?.nombre || 'N/A'}</td>
                                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{tiposMantenimiento.find(t => t.idTipo === m.idTipoMantenimiento)?.nombre || 'N/A'}</td>
                                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{new Date(m.fechaInicio).toLocaleDateString()}</td>
                                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${
                                                m.estado === 'Completado' ? 'bg-green-100 text-green-800' :
                                                    m.estado === 'En progreso' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'
                                            }`}>
                                              {m.estado}
                                            </span>
                                                  </td>
                                                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                                    {m.bitacoras && m.bitacoras.length > 0 ? (
                                                        <button
                                                            onClick={() => handleToggleBitacoras(m.idMantenimiento)}
                                                            className="text-blue-600 hover:text-blue-900 flex items-center"
                                                        >
                                                          {expandedBitacoraId === m.idMantenimiento ? (
                                                              <>
                                                                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                                                                </svg>
                                                                Ocultar
                                                              </>
                                                          ) : (
                                                              <>
                                                                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                                </svg>
                                                                Ver ({m.bitacoras.length})
                                                              </>
                                                          )}
                                                        </button>
                                                    ) : (
                                                        <span className="text-gray-500">Sin bitácoras</span>
                                                    )}
                                                  </td>
                                                </tr>
                                                {expandedBitacoraId === m.idMantenimiento && m.bitacoras && m.bitacoras.length > 0 && (
                                                    <tr>
                                                      <td colSpan={7} className="px-4 py-3 bg-gray-50">
                                                        <div className="bg-white rounded-lg shadow-xs border border-gray-200 p-4">
                                                          <h5 className="text-md font-semibold text-gray-700 mb-3">Detalle de Bitácoras</h5>
                                                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            {m.bitacoras.map(bitacora => (
                                                                <div key={bitacora.idBitacora} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition duration-200">
                                                                  {bitacora.imagenUrl && (
                                                                      <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                                                                        <img
                                                                            src={bitacora.imagenUrl}
                                                                            alt="Bitácora"
                                                                            className="w-full h-full object-cover transition duration-200 hover:scale-105"
                                                                        />
                                                                      </div>
                                                                  )}
                                                                  <div className="p-4">
                                                                    <p className="text-sm text-gray-700 mb-2">{bitacora.descripcion}</p>
                                                                    <div className="flex items-center text-xs text-gray-500">
                                                                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                      </svg>
                                                                      {new Date(bitacora.fechaHora).toLocaleString()}
                                                                    </div>
                                                                  </div>
                                                                </div>
                                                            ))}
                                                          </div>
                                                        </div>
                                                      </td>
                                                    </tr>
                                                )}
                                              </React.Fragment>
                                          ))}
                                          </tbody>
                                        </table>
                                      </div>
                                  ) : (
                                      <div className="px-4 py-6 text-center">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay mantenimientos asociados</h3>
                                        <p className="mt-1 text-sm text-gray-500">Este informe no tiene mantenimientos asociados.</p>
                                      </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                        )}
                      </React.Fragment>
                  ))
              ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron informes</h3>
                      <p className="mt-1 text-sm text-gray-500">No hay informes registrados en el sistema.</p>
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