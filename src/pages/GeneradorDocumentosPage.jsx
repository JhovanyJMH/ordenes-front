import React, { useState } from 'react';
import Swal from 'sweetalert2';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
import { FiFileText, FiUpload, FiSettings, FiDownload, FiCheckCircle, FiAlertCircle, FiClock, FiServer, FiCalendar, FiGlobe } from 'react-icons/fi';

const GeneradorDocumentosPage = () => {
  const [systemData, setSystemData] = useState({
    sistema: '',
    ip: '',
    fecha: new Date().toLocaleDateString('es-ES')
  });
  const [csvFile, setCsvFile] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [dragActive, setDragActive] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <FiFileText className="text-4xl text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-800">
              Generador de Documentos de Clave de Acceso
            </h1>
          </div>
          <p className="text-gray-600">
            Genera documentos Word personalizados para cada usuario desde un archivo CSV
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${systemData.sistema && systemData.ip ? 'bg-green-500' : 'bg-blue-500'}`}>
                {systemData.sistema && systemData.ip ? <FiCheckCircle className="text-white text-sm" /> : <span className="text-white text-sm font-bold">1</span>}
              </div>
              <span className="ml-2 text-sm text-gray-600">Configurar</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${csvFile ? 'bg-green-500' : 'bg-blue-500'}`}>
                {csvFile ? <FiCheckCircle className="text-white text-sm" /> : <span className="text-white text-sm font-bold">2</span>}
              </div>
              <span className="ml-2 text-sm text-gray-600">Cargar CSV</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white text-sm font-bold">3</span>
              </div>
              <span className="ml-2 text-sm text-gray-600">Generar</span>
            </div>
          </div>
        </div>

        {/* System Configuration Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-blue-500">
          <div className="flex items-center mb-4">
            <FiSettings className="text-2xl text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-800">
              Configuración del Sistema
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FiServer className="mr-2 text-blue-500" />
                Sistema
              </label>
              <input
                type="text"
                name="sistema"
                value={systemData.sistema}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Nombre del sistema"
              />
              {systemData.sistema && (
                <FiCheckCircle className="absolute right-3 top-9 text-green-500" />
              )}
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FiGlobe className="mr-2 text-blue-500" />
                Dirección o URL
              </label>
              <input
                type="text"
                name="ip"
                value={systemData.ip}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="https://..."
              />
              {systemData.ip && (
                <FiCheckCircle className="absolute right-3 top-9 text-green-500" />
              )}
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FiCalendar className="mr-2 text-blue-500" />
                Fecha
              </label>
              <input
                type="text"
                name="fecha"
                value={systemData.fecha}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <FiClock className="absolute right-3 top-9 text-gray-400" />
            </div>
          </div>
        </div>

        {/* CSV Upload Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-indigo-500">
          <div className="flex items-center mb-4">
            <FiUpload className="text-2xl text-indigo-600 mr-3" />
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
                dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'
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
                <span className="inline-block px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium">
                  Seleccionar archivo CSV
                </span>
              </label>
            </div>
          )}
        </div>

        {/* CSV Format Info Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-purple-500">
          <div className="flex items-center mb-4">
            <FiFileText className="text-2xl text-purple-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-800">
              Formato del CSV
            </h2>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
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
        <div className="flex justify-center">
          <button
            onClick={handleGenerate}
            disabled={generating || !systemData.sistema || !systemData.ip || !csvFile}
            className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 flex items-center ${
              generating || !systemData.sistema || !systemData.ip || !csvFile
                ? 'bg-gray-400 cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
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
