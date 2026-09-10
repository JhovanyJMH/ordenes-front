import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { getDependenciaById, updateDependencia } from '../../features/dependencias/dependenciasSlice';
import SubmitButton from '../common/SubmitButton';
import LoadingSpinner from '../common/LoadingSpinner';
import Swal from 'sweetalert2';
import { FaBuilding, FaSitemap } from 'react-icons/fa';

const DependenciaEdit = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { selected, loading } = useSelector((state) => state.dependencias);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    defaultValues: {
      secretaria: '',
      direccion: '',
      oficina: '',
    }
  });

  useEffect(() => {
    if (id) {
      dispatch(getDependenciaById(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (selected) {
      setValue('secretaria', selected.secretaria || '');
      setValue('direccion', selected.direccion || '');
      setValue('oficina', selected.oficina || '');
    }
  }, [selected, setValue]);

  const onSubmit = async (data) => {
    try {
      const result = await Swal.fire({
        title: '¿Guardar cambios?',
        text: 'Se actualizará la información de la dependencia.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'Cancelar',
      });

      if (!result.isConfirmed) return;

      // Convertir todos los campos a mayúsculas
      const dataToSend = {
        secretaria: data.secretaria?.toUpperCase() || '',
        direccion: data.direccion?.toUpperCase() || '',
        oficina: data.oficina?.toUpperCase() || '',
      };

      await dispatch(updateDependencia({ id, data: dataToSend })).unwrap();

      await Swal.fire({
        icon: 'success',
        title: 'Dependencia actualizada',
        text: 'La dependencia se actualizó correctamente.',
        confirmButtonColor: '#3085d6',
      });
      
      navigate('/catalogo-dependencias', {
        state: { updatedId: id, page: location.state?.fromPage || 1 },
      });
    } catch (error) {
      console.error('Error al actualizar dependencia:', error);
      const message = typeof error === 'string' ? error : 'Ocurrió un error al actualizar la dependencia. Intenta nuevamente.';

      Swal.fire({
        icon: 'warning',
        title: 'Aviso',
        text: message,
        confirmButtonColor: '#d33',
      });
    }
  };
  
  const isLoadingData =
    loading ||
    !selected ||
    (selected && selected.id && String(selected.id) !== String(id));

  if (isLoadingData) {
    return <LoadingSpinner message="Cargando datos de la dependencia..." />;
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Editar Dependencia</h2>
        <p className="text-gray-600">Actualice la información de la dependencia</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-[#8A2036] to-[#6B1829] px-6 py-4 flex items-center gap-3">
            <FaBuilding className="text-white text-xl" />
            <h3 className="text-lg font-semibold text-white">Información de la Dependencia</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label htmlFor="secretaria" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FaSitemap className="text-gray-400" size={14} />
                  Secretaría <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('secretaria', {
                    required: 'Este campo es requerido',
                    maxLength: {
                      value: 255,
                      message: 'La secretaría no puede exceder los 255 caracteres'
                    },
                    transform: (value) => value.toUpperCase()
                  })}
                  className={`w-full px-4 py-3 rounded-lg border-2 ${errors.secretaria ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-[#8A2036] focus:ring-[#8A2036]/20'} focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 uppercase placeholder-gray-400`}
                  placeholder="Ingrese la secretaría"
                  id="secretaria"
                  autoComplete="off"
                />
                {errors.secretaria && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span className="text-red-500">•</span> {errors.secretaria.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FaBuilding className="text-gray-400" size={14} />
                  Unidad Administrativa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('direccion', {
                    required: 'Este campo es requerido',
                    maxLength: {
                      value: 255,
                      message: 'La dirección no puede exceder los 255 caracteres'
                    },
                    transform: (value) => value.toUpperCase()
                  })}
                  className={`w-full px-4 py-3 rounded-lg border-2 ${errors.direccion ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-[#8A2036] focus:ring-[#8A2036]/20'} focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 uppercase placeholder-gray-400`}
                  placeholder="Ingrese la unidad administrativa"
                  id="direccion"
                  autoComplete="off"
                />
                {errors.direccion && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span className="text-red-500">•</span> {errors.direccion.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="oficina" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FaSitemap className="text-gray-400" size={14} />
                  Área <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('oficina', {
                    required: 'Este campo es requerido',
                    maxLength: {
                      value: 255,
                      message: 'La oficina no puede exceder los 255 caracteres'
                    },
                    transform: (value) => value.toUpperCase()
                  })}
                  className={`w-full px-4 py-3 rounded-lg border-2 ${errors.oficina ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-[#8A2036] focus:ring-[#8A2036]/20'} focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 uppercase placeholder-gray-400`}
                  placeholder="Ingrese el área"
                  id="oficina"
                  autoComplete="off"
                />
                {errors.oficina && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span className="text-red-500">•</span> {errors.oficina.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
          <SubmitButton
            type="button"
            variant="secondary"
            onClick={() => navigate('/catalogo-dependencias')}
            className="w-full sm:w-auto px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200 font-medium"
          >
            Cancelar
          </SubmitButton>
          <SubmitButton
            type="submit"
            loading={loading}
            className="w-full sm:w-auto px-8 py-3 rounded-lg bg-gradient-to-r from-[#8A2036] to-[#6B1829] text-white hover:from-[#6B1829] hover:to-[#5A1223] focus:outline-none focus:ring-2 focus:ring-[#8A2036]/30 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Actualizar
          </SubmitButton>
        </div>
      </form>
    </div>
  );
};

export default DependenciaEdit;
