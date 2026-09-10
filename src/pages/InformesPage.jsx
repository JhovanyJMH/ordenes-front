import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import informesService from '../services/informesService';
import {
  generateResumenSolicitudPdf,
  generateResumenAdscripcionPdf,
  generateResumenSustantivaPdf,
  generateServiciosAnualPdf,
} from '../utils/informesPdfGenerator';
import Swal from 'sweetalert2';
import { FiDownload, FiFileText, FiCalendar, FiBarChart2 } from 'react-icons/fi';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const defaultRange = () => {
  const now = new Date();
  const fin = now.toISOString().slice(0, 10);
  const ini = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  return { ini, fin };
};

const REPORTES = [
  {
    id: 'solicitud',
    title: 'Solicitudes atendidas',
    desc: 'Detalle por servicio, adscripción y técnico que atendió.',
    icon: FiFileText,
    color: '#8A2036',
    needsDates: true,
  },
  {
    id: 'adscripcion',
    title: 'Por adscripción',
    desc: 'Cantidad de servicios agrupados por unidad administrativa.',
    icon: FiFileText,
    color: '#E91E63',
    needsDates: true,
  },
  {
    id: 'sustantiva',
    title: 'UA sustantivas',
    desc: 'Resumen de acciones de mantenimiento en unidades sustantivas.',
    icon: FiFileText,
    color: '#6b46c1',
    needsDates: true,
  },
  {
    id: 'anual',
    title: 'Servicios anual',
    desc: 'Comparativo mensual del año actual y anterior.',
    icon: FiCalendar,
    color: '#1f7a8c',
    needsDates: false,
  },
];

const InformesPage = () => {
  const { user } = useSelector((s) => s.auth);
  const [range, setRange] = useState(defaultRange);
  const [loadingId, setLoadingId] = useState(null);
  const [anualData, setAnualData] = useState(null);
  const [loadingChart, setLoadingChart] = useState(true);

  useEffect(() => {
    loadAnualData();
  }, []);

  const loadAnualData = async () => {
    try {
      setLoadingChart(true);
      const data = await informesService.serviciosAnual();
      setAnualData(data.anual || []);
    } catch (err) {
      console.error('Error loading annual data:', err);
    } finally {
      setLoadingChart(false);
    }
  };

  const getChartData = () => {
    const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;

    const currentYearData = new Array(12).fill(0);
    const lastYearData = new Array(12).fill(0);

    (anualData || []).forEach((item) => {
      const mes = Number(item.mes) - 1;
      const anio = Number(item.anio);
      const cantidad = Number(item.cantidad) || 0;

      if (anio === currentYear && mes >= 0 && mes < 12) {
        currentYearData[mes] = cantidad;
      } else if (anio === lastYear && mes >= 0 && mes < 12) {
        lastYearData[mes] = cantidad;
      }
    });

    return {
      labels: meses,
      datasets: [
        {
          label: `Año ${lastYear}`,
          data: lastYearData,
          borderColor: '#8A2036',
          backgroundColor: 'rgba(138, 32, 54, 0.1)',
          tension: 0.3,
          fill: true,
        },
        {
          label: `Año ${currentYear}`,
          data: currentYearData,
          borderColor: '#1f7a8c',
          backgroundColor: 'rgba(31, 122, 140, 0.1)',
          tension: 0.3,
          fill: true,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 12 },
          usePointStyle: true,
        },
      },
      title: {
        display: true,
        text: 'Servicios Mensuales Atendidos - Comparativo Anual',
        font: { size: 16, weight: 'bold' },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cantidad de Servicios',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Mes',
        },
      },
    },
  };

  const handleGenerate = async (reportId) => {
    setLoadingId(reportId);
    try {
      Swal.fire({ title: 'Generando informe...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

      if (reportId === 'solicitud') {
        const data = await informesService.resumenSolicitud(range.ini, range.fin);
        generateResumenSolicitudPdf(data, range.ini, range.fin, user);
      } else if (reportId === 'adscripcion') {
        const data = await informesService.resumenAdscripcion(range.ini, range.fin);
        generateResumenAdscripcionPdf(data, range.ini, range.fin, user);
      } else if (reportId === 'sustantiva') {
        const data = await informesService.resumenSustantiva(range.ini, range.fin);
        generateResumenSustantivaPdf(data, range.ini, range.fin, user);
      } else if (reportId === 'anual') {
        const data = await informesService.serviciosAnual();
        generateServiciosAnualPdf(data, user);
      }

      Swal.fire({ icon: 'success', title: 'Informe generado', timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire('Error', err?.response?.data?.error || 'No se pudo generar el informe.', 'error');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-800">Informes</h1>
        <p className="text-sm text-gray-500">Genera reportes oficiales en PDF con el formato institucional</p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">Rango de fechas</h2>
        <p className="mb-4 text-xs text-gray-400">Aplica a informes por periodo (solicitudes cerradas con fecha de servicio)</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:max-w-xl">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500">Fecha inicio</label>
            <input
              type="date"
              value={range.ini}
              onChange={(e) => setRange((r) => ({ ...r, ini: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-colorPrimario focus:outline-none focus:ring-2 focus:ring-colorPrimario/20"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500">Fecha fin</label>
            <input
              type="date"
              value={range.fin}
              onChange={(e) => setRange((r) => ({ ...r, fin: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-colorPrimario focus:outline-none focus:ring-2 focus:ring-colorPrimario/20"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center gap-2">
          <FiBarChart2 size={20} className="text-colorPrimario" />
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Gráfico Anual de Servicios</h2>
        </div>
        <p className="mb-4 text-xs text-gray-400">Comparativo mensual de servicios atendidos entre el año actual y anterior</p>
        <div className="h-80">
          {loadingChart ? (
            <div className="flex h-full items-center justify-center text-gray-400">
              Cargando gráfico...
            </div>
          ) : (
            <Line data={getChartData()} options={chartOptions} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {REPORTES.map((rep) => {
          const Icon = rep.icon;
          return (
            <div key={rep.id} className="flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
              <div className="mb-4 flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-md" style={{ backgroundColor: rep.color }}>
                  <Icon size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{rep.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{rep.desc}</p>
                  {!rep.needsDates && <p className="mt-2 text-xs text-gray-400">No requiere rango de fechas</p>}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleGenerate(rep.id)}
                disabled={loadingId === rep.id}
                className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: rep.color }}
              >
                <FiDownload size={16} />
                {loadingId === rep.id ? 'Generando...' : 'Descargar PDF'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InformesPage;
