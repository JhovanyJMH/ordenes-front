import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEstadisticas } from '../../features/solicitudes/solicitudesSlice';
import { generateDashboardReportPdf } from '../../utils/dashboardReportPdf';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { FiFileText, FiClipboard, FiCheckCircle, FiStar, FiCpu, FiDownload } from 'react-icons/fi';
import Swal from 'sweetalert2';
import SolicitudesTable from '../solicitudes/SolicitudesTable';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const KpiCard = ({ icon: Icon, label, value, sub, color, gradient }) => (
  <div className={`relative overflow-hidden rounded-2xl border border-white/60 bg-gradient-to-br ${gradient} p-5 shadow-lg`}>
    <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-20" style={{ backgroundColor: color }} />
    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">{label}</p>
        <p className="mt-2 text-3xl font-extrabold text-gray-800">{value}</p>
        {sub && <p className="mt-1 text-xs text-gray-500">{sub}</p>}
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-md" style={{ backgroundColor: color }}>
        <Icon size={22} />
      </div>
    </div>
  </div>
);

const DashboardStats = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { stats, statsLoading } = useSelector((s) => s.solicitudes);

  useEffect(() => {
    dispatch(fetchEstadisticas());
  }, [dispatch]);

  const handleReportPdf = () => {
    if (!stats) {
      Swal.fire('Sin datos', 'Aún no hay estadísticas para generar el reporte.', 'info');
      return;
    }
    try {
      generateDashboardReportPdf(stats, user?.name);
      Swal.fire({ icon: 'success', title: 'Reporte generado', timer: 1500, showConfirmButton: false });
    } catch {
      Swal.fire('Error', 'No se pudo generar el reporte PDF.', 'error');
    }
  };

  if (statsLoading && !stats) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-colorPrimario border-t-transparent" />
      </div>
    );
  }

  const s = stats || {};

  const barData = {
    labels: (s.mensual || []).map((m) => m.label),
    datasets: [
      {
        label: 'Solicitudes',
        data: (s.mensual || []).map((m) => m.total),
        backgroundColor: 'rgba(138, 32, 54, 0.75)',
        borderColor: '#8A2036',
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
    },
  };

  const doughnutData = {
    labels: (s.por_estado || []).map((e) => e.label),
    datasets: [
      {
        data: (s.por_estado || []).map((e) => e.total),
        backgroundColor: ['#8A2036', '#1f7a8c'],
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true } },
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Panel de solicitudes</h2>
          <p className="text-sm text-gray-500">Estadísticas de tus solicitudes de servicio</p>
        </div>
        <button
          type="button"
          onClick={handleReportPdf}
          className="inline-flex items-center gap-2 self-start rounded-xl bg-colorPrimario px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
        >
          <FiDownload size={16} />
          Descargar reporte PDF
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard icon={FiClipboard} label="Abiertas" value={s.abiertas ?? 0} sub="En seguimiento" color="#8A2036" gradient="from-[#8A2036]/10 to-white" />
        <KpiCard icon={FiCheckCircle} label="Cerradas" value={s.cerradas ?? 0} sub="Finalizadas" color="#1f7a8c" gradient="from-teal-50 to-white" />
        <KpiCard icon={FiFileText} label="Este mes" value={s.mes_actual ?? 0} sub="Nuevas registradas" color="#6b46c1" gradient="from-violet-50 to-white" />
        <KpiCard icon={FiCpu} label="Con equipo" value={s.con_equipo ?? 0} sub="Hardware involucrado" color="#d97706" gradient="from-amber-50 to-white" />
        <KpiCard icon={FiStar} label="Evaluación" value={s.promedio_evaluacion ? `${s.promedio_evaluacion}/4` : '—'} sub="Promedio general" color="#0f766e" gradient="from-emerald-50 to-white" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
          <h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-gray-500">Gráfica mensual</h3>
          <p className="mb-4 text-xs text-gray-400">Solicitudes registradas — últimos 12 meses</p>
          <div className="h-64">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
          <h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-gray-500">Por estado</h3>
          <p className="mb-4 text-xs text-gray-400">Distribución abiertas vs cerradas</p>
          <div className="h-52">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
        <SolicitudesTable
          mode="tabla"
          title="Mis solicitudes"
          subtitle="ID, adscripción, servicio, técnico, fecha, estatus y descarga de PDF"
        />
      </div>
    </div>
  );
};

export default DashboardStats;
