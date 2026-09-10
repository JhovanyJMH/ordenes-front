import { Routes, Route, Link } from 'react-router-dom';
import AdscripcionesList from '../components/adscripciones/AdscripcionesList';
import AdscripcionForm from '../components/adscripciones/AdscripcionForm';
import AdscripcionEdit from '../components/adscripciones/AdscripcionEdit';

const AdscripcionesPage = () => {
  return (
    <div className="bg-[#f4f7fa] w-full">
      <div className="w-full bg-white rounded-xl shadow-lg p-4 md:p-8 lg:p-12">
        <h1 className="text-5xl font-extrabold text-colorPrimario mb-6 text-left">
          Administración de<span className="text-gray-500 font-normal"> adscripciones</span>
        </h1>

        <nav className="text-sm text-gray-500 flex items-center gap-2 mt-2 justify-start md:justify-end w-full md:w-auto mb-8">
          <Link to="/catalogo-adscripciones" className="text-colorPrimario font-semibold hover:underline">Lista de adscripciones</Link>
          <span className="mx-1">&gt;</span>
          <Link to="/catalogo-adscripciones/registrar" className="hover:underline">Registrar adscripción</Link>
        </nav>

        <Routes>
          <Route index element={<AdscripcionesList />} />
          <Route path="registrar" element={<AdscripcionForm />} />
          <Route path="editar/:id" element={<AdscripcionEdit />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdscripcionesPage;
