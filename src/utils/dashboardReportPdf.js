import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import LogoEdoMex from '../images/escudo-edomex.png';

export const generateDashboardReportPdf = (stats, userName = 'Usuario') => {
  const doc = new jsPDF();
  const fecha = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

  try {
    doc.addImage(LogoEdoMex, 'PNG', 14, 10, 20, 20);
  } catch {
    /* opcional */
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(138, 32, 54);
  doc.text('Reporte estadístico de solicitudes', 40, 18);
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`Generado: ${fecha}`, 40, 25);
  doc.text(`Usuario: ${userName}`, 40, 31);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.text('Resumen general', 14, 42);

  autoTable(doc, {
    startY: 46,
    head: [['Indicador', 'Valor']],
    body: [
      ['Solicitudes abiertas', String(stats.abiertas ?? 0)],
      ['Solicitudes cerradas', String(stats.cerradas ?? 0)],
      ['Registradas este mes', String(stats.mes_actual ?? 0)],
      ['Con equipo físico', String(stats.con_equipo ?? 0)],
      ['Promedio de evaluación', stats.promedio_evaluacion ? `${stats.promedio_evaluacion} / 4` : 'N/A'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [138, 32, 54] },
    styles: { fontSize: 9 },
  });

  const mensualY = doc.lastAutoTable.finalY + 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Solicitudes por mes (últimos 12 meses)', 14, mensualY);

  autoTable(doc, {
    startY: mensualY + 4,
    head: [['Mes', 'Total']],
    body: (stats.mensual || []).map((m) => [m.label, String(m.total)]),
    theme: 'striped',
    headStyles: { fillColor: [31, 122, 140] },
    styles: { fontSize: 8 },
  });

  if (stats.recientes?.length) {
    const recY = doc.lastAutoTable.finalY + 12;
    doc.text('Últimas solicitudes', 14, recY);
    autoTable(doc, {
      startY: recY + 4,
      head: [['Folio', 'Descripción', 'Fecha', 'Estado', 'Eval.']],
      body: stats.recientes.map((s) => [
        String(s.id),
        (s.descripcion || '').slice(0, 40),
        s.fecha || '',
        Number(s.estatus) === 1 ? 'ABIERTA' : 'CERRADA',
        s.evaluacion_ser ? `${Math.min(4, Number(s.evaluacion_ser))}/4` : '-',
      ]),
      theme: 'grid',
      headStyles: { fillColor: [107, 70, 193] },
      styles: { fontSize: 7 },
    });
  }

  doc.save(`reporte-solicitudes-${new Date().toISOString().slice(0, 10)}.pdf`);
};
