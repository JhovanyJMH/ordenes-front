import React, { useState } from 'react';
import Swal from 'sweetalert2';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
import { FiFileText, FiUpload, FiSettings, FiDownload, FiCheckCircle, FiAlertCircle, FiClock, FiServer, FiCalendar, FiGlobe } from 'react-icons/fi';

const STEPS = [
  { id: 'configuracion', label: 'Configurar', description: 'Indica el sistema, su dirección y la fecha del documento.', icon: FiSettings, color: '#8A2036' },
  { id: 'csv', label: 'Cargar CSV', description: 'Selecciona el archivo con los datos de las personas usuarias.', icon: FiUpload, color: '#BC955B' },
  { id: 'generar', label: 'Generar', description: 'Genera y descarga el documento Word personalizado.', icon: FiDownload, color: '#8A2036' },
];

const GeneradorDocumentosPage = () => {
  const [systemData, setSystemData] = useState({
    sistema: '',
    ip: '',
    fecha: new Date().toLocaleDateString('es-ES')
  });
  const [csvFile, setCsvFile] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const isConfigurationComplete = Boolean(systemData.sistema && systemData.ip);
  const isReadyToGenerate = isConfigurationComplete && Boolean(csvFile);
  const currentStep = isReadyToGenerate ? 2 : isConfigurationComplete ? 1 : 0;

  const scrollToStep = (stepId) => {
    document.getElementById(`generador-${stepId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSystemData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const parseCSV = (csvText) => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const users = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim());
        const user = {};
        headers.forEach((header, index) => {
          user[header] = values[index] || '';
        });
        users.push(user);
      }
    }

    return users;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor selecciona un archivo CSV válido'
      });
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setCsvFile(file);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Por favor arrastra un archivo CSV válido'
        });
      }
    }
  };

  const removeFile = () => {
    setCsvFile(null);
  };

  const handleGenerate = async () => {
    if (!systemData.sistema || !systemData.ip) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor completa los campos de sistema e IP'
      });
      return;
    }

    if (!csvFile) {
      Swal.fire({
        icon: 'warning',
        title: 'Archivo no seleccionado',
        text: 'Por favor selecciona un archivo CSV con los usuarios'
      });
      return;
    }

    setGenerating(true);

    try {
      // Leer el archivo CSV
      const csvText = await csvFile.text();
      const users = parseCSV(csvText);

      if (users.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'CSV vacío',
          text: 'El archivo CSV no contiene usuarios'
        });
        setGenerating(false);
        return;
      }

      // Cargar la plantilla Word
      const templateResponse = await fetch('/ENTREGA DE CLAVE DE ACCESO.docx');
      const templateArrayBuffer = await templateResponse.arrayBuffer();

      // Preparar datos para el loop con todos los usuarios
      const usersWithSystemData = users.map((user, index) => ({
        primer_apellido: user.primer_apellido || '',
        segundo_apellido: user.segundo_apellido || '',
        nombres: user.nombres || '',
        usuario: user.usuario || '',
        contraseña: user.contraseña || '',
        sistema: systemData.sistema,
        ip: systemData.ip,
        fecha: systemData.fecha,
        isLast: index === users.length - 1 // Para no agregar salto de página en el último
      }));

      // Generar un solo documento con todas las páginas
      const zip = new PizZip(templateArrayBuffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      // Renderizar con el array de usuarios para generar múltiples páginas
      doc.render({
        usuarios: usersWithSystemData
      });

      const buf = doc.getZip().generate({
        type: 'blob',
        compression: 'DEFLATE',
      });

      // Generar nombre del archivo con el nombre del sistema
      const fileName = `ENTREGA DE CLAVE DE ACCESO ${systemData.sistema}.docx`;
      saveAs(buf, fileName);

      Swal.fire({
        icon: 'success',
        title: 'Documento generado',
        text: `Se ha generado el documento con ${users.length} páginas exitosamente`
      });

    } catch (error) {
      console.error('Error general:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un error al generar el documento. Asegúrate de que la plantilla Word esté en la carpeta public y use la sintaxis de loop {#usuarios}...{/usuarios}.'
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fa] p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <FiFileText className="text-4xl text-colorPrimario mr-3" />
            <h1 className="text-3xl font-bold text-colorPrimario">
              Generador de Documentos de Clave de Acceso
            </h1>
          </div>
          <p className="text-gray-600">
            Genera documentos Word personalizados para cada usuario desde un archivo CSV
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="h-1 flex-1 rounded-full bg-gradient-to-r from-[#8A2036] to-[#BC955B]" />
            <span className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400">Generación de documentos</span>
            <div className="h-1 flex-1 rounded-full bg-gradient-to-r from-[#BC955B] to-[#8A2036]" />
          </div>
          <div className="mb-5 flex items-end justify-between gap-3">
            <p className="text-sm text-gray-500">Sigue los pasos para preparar el documento.</p>
            <p className="shrink-0 text-sm font-semibold text-gray-500">
              <span className="text-lg text-colorPrimario">{String(currentStep + 1).padStart(2, '0')}</span>
              <span className="mx-1">/</span>{String(STEPS.length).padStart(2, '0')} pasos
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {STEPS.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = index === 0
                ? isConfigurationComplete
                : index === 1 && isConfigurationComplete && Boolean(csvFile);
              const StepIcon = step.icon;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => scrollToStep(step.id)}
                  aria-current={isActive ? 'step' : undefined}
                  aria-label={`Paso ${index + 1}: ${step.label}`}
                  className={`flex min-h-[76px] min-w-0 items-center gap-3 rounded-xl border bg-white px-4 py-3 text-left transition-all sm:min-h-[84px] sm:flex-col sm:justify-center sm:gap-2 sm:text-center ${
                    isActive
                      ? 'shadow-md ring-2 ring-[#8A2036]/15'
                      : isCompleted
                        ? 'border-emerald-200 hover:border-emerald-300'
                        : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={isActive ? { borderColor: step.color } : undefined}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      isActive ? 'text-white' : isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                    }`}
                    style={isActive ? { backgroundColor: step.color } : undefined}
                  >
                    {isCompleted ? <FiCheckCircle size={18} /> : <StepIcon size={17} />}
                  </span>
                  <span className={`min-w-0 text-xs font-semibold leading-tight ${isActive ? 'text-gray-900' : isCompleted ? 'text-emerald-700' : 'text-gray-500'}`}>
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex items-start gap-4 rounded-xl border-l-4 bg-white/80 p-5 shadow-sm" style={{ borderColor: STEPS[currentStep].color }}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100" style={{ color: STEPS[currentStep].color }}>
              {React.createElement(STEPS[currentStep].icon, { size: 20 })}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Paso {currentStep + 1} de {STEPS.length}</p>
              <h2 className="mt-1 text-base font-bold text-gray-800">{STEPS[currentStep].label}</h2>
              <p className="mt-1 text-sm text-gray-600">{STEPS[currentStep].description}</p>
            </div>
          </div>
        </div>

        {/* System Configuration Card */}
        <div id="generador-configuracion" className="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-colorPrimario">
          <div className="flex items-center mb-4">
            <FiSettings className="text-2xl text-colorPrimario mr-3" />
            <h2 className="text-xl font-semibold text-gray-800">
              Configuración del Sistema
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FiServer className="mr-2 text-colorPrimario" />
                Sistema
              </label>
              <input
                type="text"
                name="sistema"
                value={systemData.sistema}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-colorPrimario focus:border-transparent transition-all"
                placeholder="Nombre del sistema"
              />
              {systemData.sistema && (
                <FiCheckCircle className="absolute right-3 top-9 text-green-500" />
              )}
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FiGlobe className="mr-2 text-colorPrimario" />
                Dirección o URL
              </label>
              <input
                type="text"
                name="ip"
                value={systemData.ip}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-colorPrimario focus:border-transparent transition-all"
                placeholder="https://..."
              />
              {systemData.ip && (
                <FiCheckCircle className="absolute right-3 top-9 text-green-500" />
              )}
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FiCalendar className="mr-2 text-colorPrimario" />
                Fecha
              </label>
              <input
                type="text"
                name="fecha"
                value={systemData.fecha}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-colorPrimario focus:border-transparent transition-all"
              />
              <FiClock className="absolute right-3 top-9 text-gray-400" />
            </div>
          </div>
        </div>

        {/* CSV Upload Card */}
        <div id="generador-csv" className="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-colorSecundario">
          <div className="flex items-center mb-4">
            <FiUpload className="text-2xl text-colorSecundario mr-3" />
            <h2 className="text-xl font-semibold text-gray-800">
              Cargar Archivo CSV
            </h2>
          </div>

          {csvFile ? (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FiCheckCircle className="text-3xl text-green-500 mr-4" />
                  <div>
                    <p className="font-semibold text-gray-800">{csvFile.name}</p>
                    <p className="text-sm text-gray-600">
                      {(csvFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={removeFile}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center"
                >
                  <FiAlertCircle className="mr-2" />
                  Eliminar
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                dragActive ? 'border-colorPrimario bg-[#fff7f7]' : 'border-gray-300 hover:border-[#8A2036]'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="csvFile"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="csvFile"
                className="cursor-pointer block"
              >
                <FiUpload className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  {dragActive ? 'Suelta el archivo aquí' : 'Arrastra y suelta tu archivo CSV aquí'}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  o haz clic para seleccionar
                </p>
                <span className="inline-block px-4 py-2 bg-[#fdf2f3] text-colorPrimario rounded-lg text-sm font-medium">
                  Seleccionar archivo CSV
                </span>
              </label>
            </div>
          )}
        </div>

        {/* CSV Format Info Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-[#BC955B]">
          <div className="flex items-center mb-4">
            <FiFileText className="text-2xl text-[#BC955B] mr-3" />
            <h2 className="text-xl font-semibold text-gray-800">
              Formato del CSV
            </h2>
          </div>
          
          <div className="bg-gradient-to-r from-[#fff7f7] to-[#f9f3eb] rounded-lg p-4 border border-[#e7d7b4]">
            <pre className="text-sm text-gray-700 overflow-x-auto font-mono">
{`primer_apellido,segundo_apellido,nombres,usuario,contraseña
Garcia,Lopez,Juan,juan.garcia,pass123
Rodriguez,Martinez,Maria,maria.rodriguez,pass456`}
            </pre>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <FiCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
              <p className="text-sm text-gray-600">
                El archivo debe estar codificado en UTF-8
              </p>
            </div>
            <div className="flex items-start">
              <FiCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
              <p className="text-sm text-gray-600">
                La primera fila contiene los encabezados
              </p>
            </div>
            <div className="flex items-start">
              <FiCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
              <p className="text-sm text-gray-600">
                Cada fila representa un usuario
              </p>
            </div>
            <div className="flex items-start">
              <FiCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
              <p className="text-sm text-gray-600">
                Los campos están separados por comas
              </p>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div id="generador-generar" className="flex justify-center">
          <button
            onClick={handleGenerate}
            disabled={generating || !systemData.sistema || !systemData.ip || !csvFile}
            className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 flex items-center ${
              generating || !systemData.sistema || !systemData.ip || !csvFile
                ? 'bg-gray-400 cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-[#8A2036] to-[#BC955B] hover:from-[#6e1729] hover:to-[#a8854d] text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {generating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Generando documentos...
              </>
            ) : (
              <>
                <FiDownload className="mr-2" />
                Generar Documentos
              </>
            )}
          </button>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            El documento se generará con el nombre: <span className="font-semibold text-gray-700">ENTREGA DE CLAVE DE ACCESO {systemData.sistema || '[SISTEMA]'}.docx</span>
          </p>
          <p className="mt-2">
            Cada usuario tendrá su propia página en el documento
          </p>
        </div>
      </div>
    </div>
  );
};

export default GeneradorDocumentosPage;
