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
import { FiEye, FiEyeOff, FiUser, FiBriefcase, FiLock, FiMail } from 'react-icons/fi';

const inputClass = 'w-full rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 shadow-sm transition-all duration-300 focus:border-[#8A2036] focus:outline-none focus:ring-2 focus:ring-[#8A2036]/20 focus:shadow-md hover:border-gray-300';
const labelClass = 'mb-2.5 block text-sm font-semibold tracking-tight text-gray-800';

const FieldLabel = ({ children, required, htmlFor }) => (
  <label htmlFor={htmlFor} className={labelClass}>
    {children}
    {required ? <span className="ml-1 text-[#8A2036]">*</span> : null}
  </label>
);

const SectionCard = ({ icon: Icon, title, children, variant = 'primary' }) => {
  const variants = {
    primary: {
      border: 'border-[#8A2036]/20',
      bg: 'bg-gradient-to-br from-[#8A2036]/5 to-[#BC955B]/5',
      text: 'text-[#8A2036]',
      iconBg: 'bg-[#8A2036]/10'
    },
    secondary: {
      border: 'border-[#1f7a8c]/20',
      bg: 'bg-gradient-to-br from-[#1f7a8c]/5 to-teal-50',
      text: 'text-[#1f7a8c]',
      iconBg: 'bg-[#1f7a8c]/10'
    },
    accent: {
      border: 'border-[#BC955B]/10',
      bg: 'bg-gradient-to-br from-[#DAC19A]/15 to-[#BC955B]/5',
      text: 'text-[#BC955B]/80',
      iconBg: 'bg-[#BC955B]/5'
    },
    success: {
      border: 'border-emerald-200',
      bg: 'bg-gradient-to-br from-emerald-50 to-teal-50',
      text: 'text-emerald-700',
      iconBg: 'bg-emerald-100'
    }
  };
  const style = variants[variant] || variants.primary;
  return (
    <div className={`rounded-2xl border ${style.border} ${style.bg} p-6 shadow-sm hover:shadow-md transition-shadow duration-300`}>
      {title ? (
        <div className={`mb-5 flex items-center gap-3 ${style.text}`}>
          {Icon ? (
            <div className={`rounded-lg p-2 ${style.iconBg}`}>
              <Icon size={20} />
            </div>
          ) : null}
          <span className="text-sm font-bold uppercase tracking-wider">{title}</span>
        </div>
      ) : null}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

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
  const [showPasswordFields, setShowPasswordFields] = useState(true);

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
      <div className="mx-auto w-full max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1 w-8 rounded-full bg-gradient-to-r from-[#8A2036] to-[#BC955B]"></div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">Nuevo usuario</p>
          </div>
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight">Crear Nuevo Usuario</h2>
          <p className="mt-2 text-base text-gray-600 leading-relaxed">Complete el formulario para registrar un nuevo usuario en el sistema</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <SectionCard icon={FiUser} title="Información Personal" variant="primary">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <FieldLabel required htmlFor="name">Nombre</FieldLabel>
                <input
                  id="name"
                  type="text"
                  {...register('name', { required: 'Este campo es requerido' })}
                  className={`${inputClass} ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''} uppercase`}
                  placeholder="Ingrese el nombre"
                  autoComplete="off"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span className="text-red-500">•</span> {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <FieldLabel required htmlFor="ap_paterno">Apellido Paterno</FieldLabel>
                <input
                  id="ap_paterno"
                  type="text"
                  {...register('ap_paterno', { required: 'Este campo es requerido' })}
                  className={`${inputClass} ${errors.ap_paterno ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''} uppercase`}
                  placeholder="Ingrese el apellido paterno"
                  autoComplete="off"
                />
                {errors.ap_paterno && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span className="text-red-500">•</span> {errors.ap_paterno.message}
                  </p>
                )}
              </div>

              <div>
                <FieldLabel required htmlFor="ap_materno">Apellido Materno</FieldLabel>
                <input
                  id="ap_materno"
                  type="text"
                  {...register('ap_materno', { required: 'Este campo es requerido' })}
                  className={`${inputClass} ${errors.ap_materno ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''} uppercase`}
                  placeholder="Ingrese el apellido materno"
                  autoComplete="off"
                />
                {errors.ap_materno && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span className="text-red-500">•</span> {errors.ap_materno.message}
                  </p>
                )}
              </div>

              <div>
                <FieldLabel required htmlFor="email">Email</FieldLabel>
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
                  className={`${inputClass} ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                  placeholder="ejemplo@correo.com"
                  autoComplete="off"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span className="text-red-500">•</span> {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <FieldLabel required htmlFor="profile">Perfil</FieldLabel>
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
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span className="text-red-500">•</span> {errors.profile.message}
                  </p>
                )}
              </div>
            </div>
          </SectionCard>

          <SectionCard icon={FiLock} title="Información de Cuenta" variant="secondary">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <FieldLabel required htmlFor="password">Contraseña</FieldLabel>
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
                    className={`${inputClass} pr-12 ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                    placeholder="Mínimo 6 caracteres"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span className="text-red-500">•</span> {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <FieldLabel required htmlFor="repeatPassword">Repetir Contraseña</FieldLabel>
                <div className="relative">
                  <input
                    id="repeatPassword"
                    type={showRepeatPassword ? "text" : "password"}
                    {...register('repeatPassword', { 
                      required: 'Este campo es requerido',
                      validate: value => value === watch('password') || 'Las contraseñas no coinciden'
                    })}
                    className={`${inputClass} pr-12 ${errors.repeatPassword || passwordError ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                    placeholder="Repita la contraseña"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                  >
                    {showRepeatPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                {(errors.repeatPassword || passwordError) && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span className="text-red-500">•</span> {errors.repeatPassword?.message || passwordError}
                  </p>
                )}
              </div>
            </div>
          </SectionCard>

          <SectionCard icon={FiBriefcase} title="Información Organizacional" variant="accent">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <FieldLabel required htmlFor="secretaria_id">Secretaría</FieldLabel>
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
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span className="text-red-500">•</span> Este campo es requerido
                  </p>
                )}
              </div>

              <div>
                <FieldLabel required htmlFor="direccion_id">Unidad Administrativa</FieldLabel>
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
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span className="text-red-500">•</span> Este campo es requerido
                  </p>
                )}
              </div>

              <div>
                <FieldLabel required htmlFor="oficina_id">Área</FieldLabel>
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
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span className="text-red-500">•</span> Este campo es requerido
                  </p>
                )}
              </div>

              <input type="hidden" name="dependencia_id" value={watch('dependencia_id')} />
            </div>
          </SectionCard>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end pt-4">
            <button
              type="button"
              onClick={() => navigate('/catalogo-usuarios')}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#BC955B]/60 bg-white px-6 py-3 text-sm font-semibold text-[#8A2036] shadow-sm transition-all duration-200 hover:bg-[#DAC19A]/10 hover:shadow-md active:scale-[0.98] sm:w-auto"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !!passwordError}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8A2036] to-[#6B1829] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#8A2036]/20 transition-all duration-200 hover:shadow-xl hover:shadow-[#8A2036]/30 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-none sm:w-auto"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </span>
              ) : (
                'Guardar Usuario'
              )}
            </button>
          </div>
        </form>
        {isLoadingDependencias && <LoadingSpinner overlay />}
      </div>
    </>
  );
};

export default UsuarioForm; 