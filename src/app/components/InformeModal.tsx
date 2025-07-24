import React, { useState, useEffect } from 'react';
import { Informe, DetalleInforme } from '../interfaces/Informe';

interface InformeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
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
  ) => void;
  informe?: Informe;
  currentUserId: string | null;
}

const InformeModal: React.FC<InformeModalProps> = ({ isOpen, onClose, onSubmit, informe, currentUserId }) => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [archivoFile, setArchivoFile] = useState<File | null>(null);
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && informe) {
      setTitulo(informe.titulo);
      setDescripcion(informe.detalles && informe.detalles.length > 0 ? informe.detalles[0].descripcion : '');
      // No se puede pre-cargar un File input por seguridad, solo se muestra el nombre si existe
      // setArchivoFile(informe.detalles && informe.detalles.length > 0 ? informe.detalles[0].archivoUrl : null);
      setReportStartDate(''); // No hay fechas de rango en el informe, se resetean
      setReportEndDate('');   // No hay fechas de rango en el informe, se resetean
    } else if (isOpen) {
      // Reset form when opening for new report
      setTitulo('');
      setDescripcion('');
      setArchivoFile(null);
      setReportStartDate('');
      setReportEndDate('');
    }
  }, [isOpen, informe]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) {
      alert('Error: No se pudo identificar al usuario.');
      return;
    }

    setSubmitting(true);

    const informeData = {
      idInforme: informe?.idInforme,
      idUsuario: parseInt(currentUserId),
      titulo: titulo,
      estado: informe?.estado || 'Generado', // Mantener estado existente o 'Generado' para nuevo
      estaEliminado: informe?.estaEliminado || false,
    };

    const detalleInformeData = {
      idDetalleInforme: informe?.detalles && informe.detalles.length > 0 ? informe.detalles[0].idDetalleInforme : undefined,
      descripcion: descripcion,
      archivoFile: archivoFile,
    };

    try {
      await onSubmit(informeData, detalleInformeData, reportStartDate, reportEndDate);
      onClose();
    } catch (error) {
      console.error('Error al guardar el informe:', error);
      alert('Error al guardar el informe. Por favor intente nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Fondo oscuro semitransparente */}
      <div className="fixed inset-0 bg-black opacity-70 z-50"></div>

      {/* Contenedor del modal */}
      <div className="fixed inset-0 flex justify-center items-center z-51">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{informe ? 'Editar Informe' : 'Crear Nuevo Informe'}</h2>
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
              <label htmlFor="titulo" className="block text-sm font-medium text-gray-700">Título del Informe *</label>
              <input
                type="text"
                id="titulo"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
                placeholder="Ej: Informe mensual de mantenimiento"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">Descripción *</label>
              <textarea
                id="descripcion"
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                required
                placeholder="Descripción detallada del informe"
              />
            </div>

            {!informe && ( // Solo mostrar fechas de rango para la creación de nuevos informes
              <>
                <div className="mb-4">
                  <label htmlFor="reportStartDate" className="block text-sm font-medium text-gray-700">Fecha Desde *</label>
                  <div className="relative">
                    <input
                      type="date"
                      id="reportStartDate"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      value={reportStartDate}
                      onChange={(e) => {
                        setReportStartDate(e.target.value);
                        if (reportEndDate && new Date(e.target.value) > new Date(reportEndDate)) {
                          setReportEndDate('');
                        }
                      }}
                      required
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label htmlFor="reportEndDate" className="block text-sm font-medium text-gray-700">Fecha Hasta *</label>
                  <div className="relative">
                    <input
                      type="date"
                      id="reportEndDate"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100"
                      value={reportEndDate}
                      onChange={(e) => setReportEndDate(e.target.value)}
                      required
                      disabled={!reportStartDate}
                      min={reportStartDate}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Archivo Adjunto (PDF/DOCX) {informe ? '(Opcional para actualizar)' : '*'}</label>
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
                        onChange={(e) => setArchivoFile(e.target.files ? e.target.files[0] : null)}
                        accept=".pdf,.docx"
                        required={!informe} // Requerido solo para nuevos informes
                      />
                    </label>
                    <p className="pl-1">o arrastrar y soltar</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {archivoFile ? archivoFile.name : (informe && informe.detalles && informe.detalles.length > 0 && informe.detalles[0].archivoUrl ? informe.detalles[0].archivoUrl.split('/').pop() : 'PDF o DOCX de hasta 10MB')}
                  </p>
                </div>
              </div>
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
                  informe ? 'Actualizar Informe' : 'Generar Informe'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default InformeModal;
