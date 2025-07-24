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
import InformeModal from '../components/InformeModal';

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
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [expandedInformeId, setExpandedInformeId] = useState<number | null>(null);
  const [expandedMantenimientos, setExpandedMantenimientos] = useState<Mantenimiento[]>([]);
  const [expandedBitacoraId, setExpandedBitacoraId] = useState<number | null>(null);
  const [isInformeModalOpen, setIsInformeModalOpen] = useState(false);
  const [currentInforme, setCurrentInforme] = useState<Informe | undefined>(undefined);
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

  const fetchInformes = async () => {
    try {
      setLoading(true);
      setError(null);

      let url = '/InformesEncabezado?EstaEliminado=false';
      if (currentUserRoleId && parseInt(currentUserRoleId.toString()) !== 1 && currentUserId) {
        url = `/InformesEncabezado?IdUsuario=${currentUserId}&EstaEliminado=false`;
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

  const handleEditInforme = (informe: Informe) => {
    setCurrentInforme(informe);
    setIsInformeModalOpen(true);
  };

  const handleDeleteInforme = async (idInforme: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este informe?')) {
      return;
    }
    try {
      // Eliminar lógicamente el encabezado del informe
      await api.put(`/InformesEncabezado/${idInforme}`, { estaEliminado: true });

      // Eliminar lógicamente el detalle del informe si existe
      const informeToDelete = informes.find(inf => inf.idInforme === idInforme);
      if (informeToDelete && informeToDelete.detalles && informeToDelete.detalles.length > 0) {
        const detalleId = informeToDelete.detalles[0].idDetalleInforme;
        await api.put(`/DetalleInforme/${detalleId}`, { estaEliminado: true });
      }

      fetchInformes(); // Refrescar la lista de informes
      alert('Informe eliminado exitosamente.');
    } catch (err) {
      console.error('Error al eliminar informe:', err);
      alert('Error al eliminar el informe. Por favor intente nuevamente.');
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

    fetchInformes(); // Initial fetch

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

    fetchUsers();
    fetchParqueaderos();
    fetchTiposMantenimiento();
  }, [router, currentUserId, currentUserRoleId]); // Dependencias actualizadas

  const handleSubmit = async (
    informeData: {
      idInforme?: number;
      idUsuario: number;
      titulo: string;
      estado: string;
      estaEliminado?: boolean;
    },
    detalleInformeData: {
      idDetalleInforme?: number;
      descripcion: string;
      archivoFile: File | null;
    },
    reportStartDate: string,
    reportEndDate: string
  ) => {
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      if (!currentUserId) {
        throw new Error('No se pudo identificar al usuario');
      }

      let newInforme: Informe;
      let idInforme: number;

      if (informeData.idInforme) {
        // Actualizar informe existente
        const response = await api.put(`/InformesEncabezado/${informeData.idInforme}`, informeData);
        newInforme = response.data;
        idInforme = newInforme.idInforme;
      } else {
        // Crear nuevo informe
        const response = await api.post('/InformesEncabezado', {
          idUsuario: parseInt(currentUserId),
          titulo: informeData.titulo,
          estado: 'Generado',
          estaEliminado: false,
        });
        newInforme = response.data;
        idInforme = newInforme.idInforme;

        // Asociar mantenimientos solo si es un nuevo informe
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
      }

      // Manejar DetalleInforme (crear o actualizar)
      if (detalleInformeData.archivoFile || detalleInformeData.descripcion) {
        const formData = new FormData();
        formData.append('idInforme', idInforme.toString());
        formData.append('descripcion', detalleInformeData.descripcion);
        if (detalleInformeData.archivoFile) {
          formData.append('archivoFile', detalleInformeData.archivoFile);
        }

        if (detalleInformeData.idDetalleInforme) {
          // Actualizar DetalleInforme existente
          await api.put(`/DetalleInforme/${detalleInformeData.idDetalleInforme}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
        } else if (detalleInformeData.archivoFile) {
          // Crear nuevo DetalleInforme (solo si hay un archivo, la descripción sola no crea un detalle)
          await api.post('/DetalleInforme', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
        }
      }

      setSubmitSuccess(informeData.idInforme ? 'Informe actualizado exitosamente!' : 'Informe creado exitosamente!');
      fetchInformes(); // Llamar a la función de carga de informes para actualizar la lista
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      setSubmitError(error.response?.data?.message || error.message || 'Error al guardar el informe');
      throw error; // Re-throw para que el modal pueda manejar el error
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

        {/* Botón para abrir el modal de creación */}
        {currentUserRoleId !== 1 && (
            <div className="mb-8">
              <button
                  onClick={() => {
                    setCurrentInforme(undefined); // Para crear un nuevo informe
                    setIsInformeModalOpen(true);
                  }}
                  className="bg-orange-500 px-4 py-2 bg-primary hover:bg-primary/80 text-white font-medium rounded-lg shadow-md transition-colors duration-300"
              >
                + Nuevo Informe
              </button>
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
                            {currentUserRoleId !== 1 && (
                                <>
                                  <button
                                      onClick={() => handleEditInforme(informe)}
                                      className="cursor-pointer px-3 py-1 bg-blue-400 text-white text-xs rounded-md hover:bg-blue-500 transition-colors duration-200"
                                  >
                                    Editar
                                  </button>
                                  <button
                                      onClick={() => handleDeleteInforme(informe.idInforme)}
                                      className="cursor-pointer px-3 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600 transition-colors duration-200"
                                  >
                                    Eliminar
                                  </button>
                                </>
                            )}
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
        {/* Informe Modal */}
        <InformeModal
            isOpen={isInformeModalOpen}
            onClose={() => setIsInformeModalOpen(false)}
            onSubmit={handleSubmit}
            informe={currentInforme}
            currentUserId={currentUserId}
        />
      </div>
  );
}