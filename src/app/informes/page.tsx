'use client';
import { useState, useEffect } from 'react';
import { Informe } from '../interfaces/Informe';
import Cookies from "js-cookie";
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRoleId, setCurrentUserRoleId] = useState<number | null>(null);
  const [newReportTitle, setNewReportTitle] = useState('');
  const [newReportDescription, setNewReportDescription] = useState('');
  const [newReportFile, setNewReportFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const router = useRouter();

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

    fetchInformes();
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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
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
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-6">Gestión de Informes</h1>

        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Crear Nuevo Informe</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Título del Informe</label>
              <input
                  type="text"
                  id="title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={newReportTitle}
                  onChange={(e) => setNewReportTitle(e.target.value)}
                  required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                  id="description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={newReportDescription}
                  onChange={(e) => setNewReportDescription(e.target.value)}
                  required
              />
            </div>
            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">Archivo (PDF/DOCX)</label>
              <input
                  type="file"
                  id="file"
                  className="w-full px-3 py-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  onChange={(e) => setNewReportFile(e.target.files ? e.target.files[0] : null)}
                  accept=".pdf,.docx"
                  required
              />
            </div>
            <button
                type="submit"
                className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md transition-colors duration-300 disabled:opacity-50"
                disabled={submitting}
            >
              {submitting ? 'Creando...' : 'Crear Informe'}
            </button>
            {submitError && <p className="text-red-500 text-sm mt-2">{submitError}</p>}
            {submitSuccess && <p className="text-green-500 text-sm mt-2">{submitSuccess}</p>}
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Listado de Informes</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
              {informes.map((informe) => (
                  <tr key={informe.idInforme} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{informe.idInforme}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{informe.idUsuario}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{informe.titulo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(informe.fechaCreacion).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                        informe.estado === 'Completado' ? 'bg-green-100 text-green-800' :
                            informe.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                    }`}>
                      {informe.estado}
                    </span>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
}