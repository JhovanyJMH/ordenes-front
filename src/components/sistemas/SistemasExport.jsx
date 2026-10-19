import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { FiDownload } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { useState } from 'react';
import api from '../../services/api';

const SistemasExport = ({ sistemas, onLoad }) => {
  const [loading, setLoading] = useState(false);

  const exportPDF = async () => {
    setLoading(true);
    try {
      let data = sistemas;
      if (onLoad) {
        data = await onLoad();
      }
      if (!data || data.length === 0) {
        Swal.fire({ icon: 'warning', title: 'Sin datos', text: 'No hay sistemas para exportar.' });
        return;
      }
      
      const doc = new jsPDF('l', 'mm', 'a4');
      
      // Title
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Reporte de Sistemas', 14, 15);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 14, 22);
      
      // Define columns
      const columns = [
      { header: 'Año', dataKey: 'anio_desarrollo' },
      { header: 'Nombre', dataKey: 'nombre' },
      { header: 'Siglas', dataKey: 'siglas' },
      { header: 'Estado', dataKey: 'estado_operativo' },
      { header: 'Impacto', dataKey: 'nivel_impacto' },
      { header: 'Versión', dataKey: 'version' },
      { header: 'Tipo', dataKey: 'tipo_sistema' },
      { header: 'URL', dataKey: 'url' },
      { header: 'Ambiente', dataKey: 'ambiente_despliegue' },
      { header: 'Infraestructura', dataKey: 'tipo_infraestructura' },
      { header: 'Fecha Conclusión', dataKey: 'fecha_conclusion_desarrollo' },
      { header: 'Fecha Producción', dataKey: 'fecha_liberacion_produccion' },
      { header: 'Última Actualización', dataKey: 'ultima_actualizacion' },
      { header: 'Unidad Administrativa', dataKey: 'adscripcion_nombre' },
      { header: 'Enlace', dataKey: 'enlace_empleado_nombre' },
      { header: 'Líder', dataKey: 'lider_administrador_nombre' },
      { header: 'Objetivo', dataKey: 'objetivo' },
      { header: 'Descripción Funcional', dataKey: 'descripcion_funcional' },
      { header: 'Principales Módulos', dataKey: 'principales_modulos' },
      { header: 'Alcance', dataKey: 'alcance' },
      { header: 'Plataforma', dataKey: 'plataforma_desarrollo' },
      { header: 'Arquitectura', dataKey: 'arquitectura' },
      { header: 'Código Fuente', dataKey: 'cuenta_codigo_fuente' },
      { header: 'Repositorio', dataKey: 'repositorio_codigo' },
      { header: 'Documentación', dataKey: 'cuenta_documentacion_tecnica' },
      { header: 'Actualización Doc', dataKey: 'actualizacion_documentacion' },
      { header: 'Lenguaje', dataKey: 'lenguaje_desarrollo' },
      { header: 'Framework', dataKey: 'framework' },
      { header: 'Base de Datos', dataKey: 'gestor_base_datos' },
      { header: 'Interoperable', dataKey: 'es_interoperable' },
      { header: 'Observaciones', dataKey: 'observaciones' },
    ];
    
    // Prepare data
    const rows = data.map(s => ({
      anio_desarrollo: s.anio_desarrollo || '',
      nombre: s.nombre || '',
      siglas: s.siglas || '',
      estado_operativo: s.estado_operativo || '',
      nivel_impacto: s.nivel_impacto || '',
      version: s.version || '',
      tipo_sistema: s.tipo_sistema || '',
      url: s.url || '',
      ambiente_despliegue: s.ambiente_despliegue || '',
      tipo_infraestructura: s.tipo_infraestructura || '',
      fecha_conclusion_desarrollo: s.fecha_conclusion_desarrollo || '',
      fecha_liberacion_produccion: s.fecha_liberacion_produccion || '',
      ultima_actualizacion: s.ultima_actualizacion || '',
      adscripcion_nombre: s.adscripcion_nombre || '',
      enlace_empleado_nombre: s.enlace_empleado_nombre || '',
      lider_administrador_nombre: s.lider_administrador_nombre || '',
      objetivo: s.objetivo || '',
      descripcion_funcional: s.descripcion_funcional || '',
      principales_modulos: s.principales_modulos || '',
      alcance: s.alcance || '',
      plataforma_desarrollo: s.plataforma_desarrollo || '',
      arquitectura: s.arquitectura || '',
      cuenta_codigo_fuente: s.cuenta_codigo_fuente || '',
      repositorio_codigo: s.repositorio_codigo || '',
      cuenta_documentacion_tecnica: s.cuenta_documentacion_tecnica || '',
      actualizacion_documentacion: s.actualizacion_documentacion || '',
      lenguaje_desarrollo: s.lenguaje_desarrollo || '',
      framework: s.framework || '',
      gestor_base_datos: s.gestor_base_datos || '',
      es_interoperable: s.es_interoperable || '',
      observaciones: s.observaciones || '',
    }));
    
    // Generate table
    autoTable(doc, {
      columns,
      data: rows,
      startY: 28,
      styles: {
        fontSize: 7,
        cellPadding: 2,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [138, 32, 54],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 6,
      },
      columnStyles: {
        nombre: { cellWidth: 25 },
        objetivo: { cellWidth: 30 },
        descripcion_funcional: { cellWidth: 30 },
        principales_modulos: { cellWidth: 25 },
        alcance: { cellWidth: 25 },
        url: { cellWidth: 20 },
      },
    });
    
    doc.save('reporte_sistemas.pdf');
    } finally {
      setLoading(false);
    }
  };
  
  const exportExcel = async () => {
    setLoading(true);
    try {
      const response = await api.get('/sistemas/exportar', {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, 'Inventario de sistemas para PT 2025.xlsx');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo exportar el archivo Excel.',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex gap-2">
      <button
        onClick={exportPDF}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        title="Exportar a PDF"
      >
        {loading ? 'Cargando...' : <><FiDownload /> PDF</>}
      </button>
      <button
        onClick={exportExcel}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        title="Exportar a Excel"
      >
        {loading ? 'Cargando...' : <><FiDownload /> Excel</>}
      </button>
    </div>
  );
};

export default SistemasExport;
