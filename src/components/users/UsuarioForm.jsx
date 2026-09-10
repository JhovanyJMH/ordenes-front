import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createUser, clearError, clearSuccessMessage } from '../../features/users/usersSlice';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import CustomSelect from '../common/CustomSelect';
import Swal from 'sweetalert2';
import { dependenciasService } from '../../services/dependenciasService';
import LoadingSpinner from '../common/LoadingSpinner';
import SubmitButton from '../common/SubmitButton';
import { FaEye, FaEyeSlash, FaUser, FaBuilding, FaLock, FaEnvelope, FaIdCard } from 'react-icons/fa';

const UsuarioForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, successMessage } = useSelector((state) => state.users);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      name: '',
      ap_paterno: '',
      ap_materno: '',
      email: '',
      password: '',
      repeatPassword: '',
      profile: '2',
      dependencia_id: '',
      secretaria_id: '',
      direccion_id: '',
      oficina_id: ''
    }
  });

  // Registrar los campos requeridos
  useEffect(() => {
    register('secretaria_id', { required: 'Este campo es requerido' });
    register('direccion_id', { required: 'Este campo es requerido' });
    register('oficina_id', { required: 'Este campo es requerido' });
  }, [register]);

  // Estados para los nuevos campos
  const [secretarias, setSecretarias] = useState([]);
  const [direcciones, setDirecciones] = useState([]);
  const [oficinas, setOficinas] = useState([]);
  const [selectedSecretaria, setSelectedSecretaria] = useState('');
  const [selectedDireccion, setSelectedDireccion] = useState('');
  const [selectedOficina, setSelectedOficina] = useState('');
  const [isLoadingDependencias, setIsLoadingDependencias] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Función para encontrar el primer campo vacío
  const findFirstEmptyField = (data) => {
    const requiredFields = [
      'name',
      'ap_paterno',
      'ap_materno',
      'email',
      'password',
      'repeatPassword',
      'profile',
      'dependencia_id',
      'secretaria_id',
      'direccion_id',
      'oficina_id'
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        return field;
      }
    }
    return null;
  };

  // Cargar secretarías
  useEffect(() => {
    const loadSecretarias = async () => {
      setIsLoadingDependencias(true);
      try {
        const data = await dependenciasService.getSecretarias();
        setSecretarias(data);
      } catch (error) {
        setSecretarias([]);
      } finally {
        setIsLoadingDependencias(false);
      }
    };
    loadSecretarias();
  }, []);

  // Cargar direcciones
  useEffect(() => {
    const loadDirecciones = async () => {
      if (selectedSecretaria) {
        setIsLoadingDependencias(true);
        try {
          const data = await dependenciasService.getDirecciones(selectedSecretaria);
          setDirecciones(data);
        } catch (error) {
          console.error('Error al cargar direcciones en el componente:', error);
          setDirecciones([]);
        } finally {
          setIsLoadingDependencias(false);
        }
      } else {
        setDirecciones([]);
      }
    };
    loadDirecciones();
  }, [selectedSecretaria]);

  // Cargar oficinas
  useEffect(() => {
    const loadOficinas = async () => {
      if (selectedDireccion && selectedSecretaria) {
        setIsLoadingDependencias(true);
        try {
          const data = await dependenciasService.getOficinas(selectedDireccion, selectedSecretaria);
          setOficinas(data);
        } catch (error) {
          setOficinas([]);
        } finally {
          setIsLoadingDependencias(false);
        }
      } else {
        setOficinas([]);
      }
    };
    loadOficinas();
  }, [selectedDireccion, selectedSecretaria]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'secretaria_id') {
      setSelectedSecretaria(value);
      setSelectedDireccion('');
      setSelectedOficina('');
      setDirecciones([]);
      setOficinas([]);
      setValue('dependencia_id', '');
    } else if (name === 'direccion_id') {
      setSelectedDireccion(value);
      setSelectedOficina('');
      setOficinas([]);
      setValue('dependencia_id', '');
    } else if (name === 'oficina_id') {
      setSelectedOficina(value);
      const oficinaSeleccionada = oficinas.find(ofi => ofi.oficina_id === value);
      setValue('dependencia_id', oficinaSeleccionada ? oficinaSeleccionada.id.toString() : '');
    } else {
      // Convertir a mayúsculas para nombre y apellidos
      if (name === 'name' || name === 'ap_paterno' || name === 'ap_materno') {
        setValue(name, value.toUpperCase());
      } else {
        setValue(name, type === 'checkbox' ? checked : value);
      }
    }

    if (name === 'password' || name === 'repeatPassword') {
      const password = name === 'password' ? value : watch('password');
      const repeatPassword = name === 'repeatPassword' ? value : watch('repeatPassword');
      
      if (password && repeatPassword && password !== repeatPassword) {
        setPasswordError('Las contraseñas no coinciden');
      } else {
        setPasswordError('');
      }
    }
  };

  const onSubmit = async (data) => {
    if (data.password !== data.repeatPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    // Convertir a mayúsculas antes de enviar
    const formData = {
      ...data,
      name: data.name.toUpperCase(),
      ap_paterno: data.ap_paterno.toUpperCase(),
      ap_materno: data.ap_materno.toUpperCase(),
      // Agregar información de paginación para el backend
      per_page: 50, // Valor por defecto
      search: '' // Búsqueda vacía por defecto
    };

    try {
      const result = await dispatch(createUser(formData));
      
      if (result.meta.requestStatus === 'fulfilled') {
        Swal.fire({
          title: '¡Éxito!',
          text: 'Usuario creado correctamente',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        navigate('/catalogo-usuarios');
      }
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: error || 'Ocurrió un error al crear el usuario',
        icon: 'error'
      });
    }
  };

  return (
    <>
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Crear Nuevo Usuario</h2>
          <p className="text-gray-600">Complete el formulario para registrar un nuevo usuario en el sistema</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-[#8A2036] to-[#6B1829] px-6 py-4 flex items-center gap-3">
              <FaUser className="text-white text-xl" />
              <h3 className="text-lg font-semibold text-white">Información Personal</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Nombre */}
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FaIdCard className="text-gray-400" size={14} />
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    {...register('name', { required: 'Este campo es requerido' })}
                    className={`w-full px-4 py-3 rounded-lg border-2 ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-[#8A2036] focus:ring-[#8A2036]/20'} focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 uppercase placeholder-gray-400`}
                    placeholder="Ingrese el nombre"
                    autoComplete="off"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span className="text-red-500">•</span> {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Apellido Paterno */}
                <div className="space-y-2">
                  <label htmlFor="ap_paterno" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FaIdCard className="text-gray-400" size={14} />
                    Apellido Paterno <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="ap_paterno"
                    type="text"
                    {...register('ap_paterno', { required: 'Este campo es requerido' })}
                    className={`w-full px-4 py-3 rounded-lg border-2 ${errors.ap_paterno ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-[#8A2036] focus:ring-[#8A2036]/20'} focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 uppercase placeholder-gray-400`}
                    placeholder="Ingrese el apellido paterno"
                    autoComplete="off"
                  />
                  {errors.ap_paterno && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span className="text-red-500">•</span> {errors.ap_paterno.message}
                    </p>
                  )}
                </div>

                {/* Apellido Materno */}
                <div className="space-y-2">
                  <label htmlFor="ap_materno" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FaIdCard className="text-gray-400" size={14} />
                    Apellido Materno <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="ap_materno"
                    type="text"
                    {...register('ap_materno', { required: 'Este campo es requerido' })}
                    className={`w-full px-4 py-3 rounded-lg border-2 ${errors.ap_materno ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-[#8A2036] focus:ring-[#8A2036]/20'} focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 uppercase placeholder-gray-400`}
                    placeholder="Ingrese el apellido materno"
                    autoComplete="off"
                  />
                  {errors.ap_materno && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span className="text-red-500">•</span> {errors.ap_materno.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FaEnvelope className="text-gray-400" size={14} />
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...register('email', { 
                      required: 'Este campo es requerido',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email inválido'
                      }
                    })}
                    className={`w-full px-4 py-3 rounded-lg border-2 ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-[#8A2036] focus:ring-[#8A2036]/20'} focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 placeholder-gray-400`}
                    placeholder="ejemplo@correo.com"
                    autoComplete="off"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span className="text-red-500">•</span> {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Perfil */}
                <div className="space-y-2">
                  <label htmlFor="profile" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FaUser className="text-gray-400" size={14} />
                    Perfil <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    id="profile"
                    name="profile"
                    value={{
                      value: watch('profile') || "2",
                      label: watch('profile') === "1" ? "Administrador" : watch('profile') === "2" ? "Operativo" : "Enlace"
                    }}
                    onChange={(option) => {
                      setValue('profile', option.value);
                      handleChange({
                        target: {
                          name: 'profile',
                          value: option.value
                        }
                      });
                    }}
                    options={[
                      { value: "1", label: "Administrador" },
                      { value: "2", label: "Operativo" },
                      { value: "3", label: "Enlace" },
                    ]}
                    isMulti={false}
                    placeholder="Seleccione un perfil"
                  />
                  {errors.profile && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span className="text-red-500">•</span> {errors.profile.message}
                    </p>
                  )}
                </div>

              </div>
            </div>
          </div>

          {/* Account Information Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-[#BC955B] to-[#9A7A4A] px-6 py-4 flex items-center gap-3">
              <FaLock className="text-white text-xl" />
              <h3 className="text-lg font-semibold text-white">Información de Cuenta</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contraseña */}
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FaLock className="text-gray-400" size={14} />
                    Contraseña <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      {...register('password', { 
                        required: 'Este campo es requerido',
                        minLength: {
                          value: 6,
                          message: 'La contraseña debe tener al menos 6 caracteres'
                        }
                      })}
                      className={`w-full px-4 py-3 pr-12 rounded-lg border-2 ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-[#BC955B] focus:ring-[#BC955B]/20'} focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 placeholder-gray-400`}
                      placeholder="Mínimo 6 caracteres"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                    >
                      {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span className="text-red-500">•</span> {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Repetir Contraseña */}
                <div className="space-y-2">
                  <label htmlFor="repeatPassword" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FaLock className="text-gray-400" size={14} />
                    Repetir Contraseña <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="repeatPassword"
                      type={showRepeatPassword ? "text" : "password"}
                      {...register('repeatPassword', { 
                        required: 'Este campo es requerido',
                        validate: value => value === watch('password') || 'Las contraseñas no coinciden'
                      })}
                      className={`w-full px-4 py-3 pr-12 rounded-lg border-2 ${errors.repeatPassword || passwordError ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-[#BC955B] focus:ring-[#BC955B]/20'} focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 placeholder-gray-400`}
                      placeholder="Repita la contraseña"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                    >
                      {showRepeatPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                    </button>
                  </div>
                  {(errors.repeatPassword || passwordError) && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span className="text-red-500">•</span> {errors.repeatPassword?.message || passwordError}
                    </p>
                  )}
                </div>

              </div>
            </div>
          </div>

          {/* Organizational Information Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-[#DAC19A] to-[#B8A078] px-6 py-4 flex items-center gap-3">
              <FaBuilding className="text-white text-xl" />
              <h3 className="text-lg font-semibold text-white">Información Organizacional</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Secretaría */}
                <div className="space-y-2">
                  <label htmlFor="secretaria_id" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FaBuilding className="text-gray-400" size={14} />
                    Secretaría <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    id="secretaria_id"
                    name="secretaria_id"
                    value={secretarias.find(sec => sec.secretaria_id === selectedSecretaria)
                      ? { value: selectedSecretaria, label: secretarias.find(sec => sec.secretaria_id === selectedSecretaria).secretaria }
                      : null}
                    onChange={(option) => {
                      handleChange({
                        target: {
                          name: 'secretaria_id',
                          value: option ? option.value : ''
                        }
                      });
                      setValue('secretaria_id', option ? option.value : '', { shouldValidate: true });
                    }}
                    options={secretarias.map(sec => ({
                      value: sec.secretaria_id,
                      label: sec.secretaria
                    }))}
                    isMulti={false}
                    placeholder="Seleccione una secretaría"
                    isDisabled={isLoadingDependencias}
                    error={errors.secretaria_id}
                  />
                  {errors.secretaria_id && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span className="text-red-500">•</span> Este campo es requerido
                    </p>
                  )}
                </div>

                {/* Dirección */}
                <div className="space-y-2">
                  <label htmlFor="direccion_id" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FaBuilding className="text-gray-400" size={14} />
                    Unidad Administrativa <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    id="direccion_id"
                    name="direccion_id"
                    value={direcciones.find(dir => dir.direccion_id === selectedDireccion)
                      ? { value: selectedDireccion, label: direcciones.find(dir => dir.direccion_id === selectedDireccion).direccion }
                      : null}
                    onChange={(option) => {
                      handleChange({
                        target: {
                          name: 'direccion_id',
                          value: option ? option.value : ''
                        }
                      });
                      setValue('direccion_id', option ? option.value : '', { shouldValidate: true });
                    }}
                    options={direcciones.map(dir => ({
                      value: dir.direccion_id,
                      label: dir.direccion
                    }))}
                    isMulti={false}
                    placeholder="Seleccione una dirección"
                    isDisabled={!selectedSecretaria || isLoadingDependencias}
                    error={errors.direccion_id}
                  />
                  {errors.direccion_id && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span className="text-red-500">•</span> Este campo es requerido
                    </p>
                  )}
                </div>

                {/* Oficina */}
                <div className="space-y-2">
                  <label htmlFor="oficina_id" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FaBuilding className="text-gray-400" size={14} />
                    Área <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    id="oficina_id"
                    name="oficina_id"
                    value={oficinas.find(ofi => ofi.oficina_id === selectedOficina)
                      ? { value: selectedOficina, label: oficinas.find(ofi => ofi.oficina_id === selectedOficina).oficina }
                      : null}
                    onChange={(option) => {
                      handleChange({
                        target: {
                          name: 'oficina_id',
                          value: option ? option.value : ''
                        }
                      });
                      setValue('oficina_id', option ? option.value : '', { shouldValidate: true });
                    }}
                    options={oficinas.map(ofi => ({
                      value: ofi.oficina_id,
                      label: ofi.oficina
                    }))}
                    isMulti={false}
                    placeholder="Seleccione una oficina"
                    isDisabled={!selectedDireccion || isLoadingDependencias}
                    error={errors.oficina_id}
                  />
                  {errors.oficina_id && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span className="text-red-500">•</span> Este campo es requerido
                    </p>
                  )}
                </div>

                {/* Campo oculto para dependencia_id */}
                <input type="hidden" name="dependencia_id" value={watch('dependencia_id')} />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
            <SubmitButton
              type="button"
              variant="secondary"
              onClick={() => navigate('/catalogo-usuarios')}
              className="w-full sm:w-auto px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200 font-medium"
            >
              Cancelar
            </SubmitButton>
            <SubmitButton
              type="submit"
              loading={loading}
              disabled={!!passwordError}
              className="w-full sm:w-auto px-8 py-3 rounded-lg bg-gradient-to-r from-[#8A2036] to-[#6B1829] text-white hover:from-[#6B1829] hover:to-[#5A1223] focus:outline-none focus:ring-2 focus:ring-[#8A2036]/30 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Guardar Usuario
            </SubmitButton>
          </div>
        </form>
        {isLoadingDependencias && <LoadingSpinner overlay />}
      </div>
    </>
  );
};

export default UsuarioForm; 