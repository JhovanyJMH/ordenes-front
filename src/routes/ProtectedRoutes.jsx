import { Routes, Route, Navigate } from 'react-router-dom';
import UsersPage from '../pages/UsersPage';
import DependenciasPage from '../pages/DependenciasPage';
import AdscripcionesPage from '../pages/AdscripcionesPage';
import DashboardPage from '../pages/DashboardPage';
import Layout from '../components/Layout';
import EmpleadosPage from '../pages/EmpleadosPage';
import CategoriasPage from '../pages/CategoriasPage';
import EquiposPage from '../pages/EquiposPage';
import RefaccionesPage from '../pages/RefaccionesPage';
import SolicitudesPage from '../pages/SolicitudesPage';
import SolicitudesGeneralPage from '../pages/SolicitudesGeneralPage';
import InformesPage from '../pages/InformesPage';
import GeneradorDocumentosPage from '../pages/GeneradorDocumentosPage';
import LiberacionPage from '../pages/LiberacionPage';
import ControlCambioPage from '../pages/ControlCambioPage';
import AdminRoute from '../components/AdminRoute';
import SistemasPage from '../pages/SistemasPage';

const ProtectedRoutes = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/solicitudes-general" element={<AdminRoute><SolicitudesGeneralPage /></AdminRoute>} />
        <Route path="/informes" element={<AdminRoute><InformesPage /></AdminRoute>} />
        <Route path="/generador-documentos" element={<AdminRoute><GeneradorDocumentosPage /></AdminRoute>} />
        <Route path="/fichas-liberacion/*" element={<AdminRoute><LiberacionPage /></AdminRoute>} />
        <Route path="/control-cambios/*" element={<AdminRoute><ControlCambioPage /></AdminRoute>} />
        <Route path="/catalogo-usuarios/*" element={<UsersPage />} />
        <Route path="/catalogo-dependencias/*" element={<DependenciasPage />} />
        <Route path="/catalogo-adscripciones/*" element={<AdscripcionesPage />} />
        <Route path="/catalogo-empleados/*" element={<EmpleadosPage />} />
        <Route path="/catalogo-categorias/*" element={<CategoriasPage />} />
        <Route path="/catalogo-equipos/*" element={<EquiposPage />} />
        <Route path="/catalogo-refacciones/*" element={<RefaccionesPage />} />
        <Route path="/catalogo-sistemas/*" element={<AdminRoute><SistemasPage /></AdminRoute>} />
        <Route path="/solicitudes/*" element={<SolicitudesPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default ProtectedRoutes; 