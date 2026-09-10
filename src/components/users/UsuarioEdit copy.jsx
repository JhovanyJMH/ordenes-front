import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { updateUser, clearError, clearSuccessMessage } from '../../features/users/usersSlice';
import { dependenciasService } from '../../services/dependenciasService';
import { useForm } from 'react-hook-form';
import CustomSelect from '../common/CustomSelect';
import Swal from 'sweetalert2';
import SubmitButton from '../common/SubmitButton';
import LoadingSpinner from '../common/LoadingSpinner';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const UsuarioEdit = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { list: users, loading, error, successMessage } = useSelector((state) => state.users);
  const { register, handleSubmit: handleFormSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      name: '',
      ap_paterno: '',
      ap_materno: '',
      email: '',
      password: '',
      repeatPassword: '',
      profile: '',
      status: true,
      secretaria_id: '',
      direccion_id: '',
      oficina_id: '',
      dependencia_id: ''
    }
  });

  // Estados para los campos de dependencias
  const [secretarias, setSecretarias] = useState([]);
  const [direcciones, setDirecciones] = useState([]);
  const [oficinas, setOficinas] = useState([]);
  const [selectedSecretaria, setSelectedSecretaria] = useState('');
  const [selectedDireccion, setSelectedDireccion] = useState('');
  const [selectedOficina, setSelectedOficina] = useState('');
  const [isLoadingDependencias, setIsLoadingDependencias] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const [form, setForm] = useState({
    name: '',
    ap_paterno: '',
    ap_materno: '',
    email: '',
    password: '',
    repeatPassword: '',
    profile: 'user',
    status: true,
    secretaria_id: '',
    direccion_id: '',
    oficina_id: '',
    dependencia_id: ''
  });

  // Registrar los campos requeridos
  useEffect(() => {
    register('name', { required: 'Este campo es requerido' });
    register('ap_paterno', { required: 'Este campo es requerido' });
    register('ap_materno', { required: 'Este campo es requerido' });
    register('email', { 
      required: 'Este campo es requerido',
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: 'Email inválido'
      }
    });
    register('password', {
      minLength: {
        value: 8,
        message: 'La contraseña debe tener al menos 8 caracteres'
      },
      validate: (value) => {
        if (value && value.length > 0 && value.length < 8) {
          return 'La contraseña debe tener al menos 8 caracteres';
        }
        return true;
      }
    });
    register('repeatPassword', {
      validate: (value) => {
        if (value !== form.password) {
          return 'Las contraseñas no coinciden';
        }
        return true;
      }
    });
    register('profile', { required: 'Este campo es requerido' });
    register('secretaria_id', { required: 'Este campo es requerido' });
    register('direccion_id', { required: 'Este campo es requerido' });
    register('oficina_id', { required: 'Este campo es requerido' });
  }, [register, form.password]);

  // Cargar secretarías
  useEffect(() => {
    const loadSecretarias = async () => {
      try {
        const data = await dependenciasService.getSecretarias();
        setSecretarias(data);
      } catch (error) {
        console.error('Error al cargar secretarías:', error);
      }
    };
    loadSecretarias();
  }, []);

  // Cargar direcciones cuando se selecciona una secretaría
  useEffect(() => {
    const loadDirecciones = async () => {
      if (selectedSecretaria) {
        try {
          const data = await dependenciasService.getDirecciones(selectedSecretaria);
          setDirecciones(data);
        } catch (error) {
          console.error('Error al cargar direcciones:', error);
          setDirecciones([]);
        }
      }
    };
    loadDirecciones();
  }, [selectedSecretaria]);

  // Cargar oficinas cuando se selecciona una dirección
  useEffect(() => {
    const loadOficinas = async () => {
      if (selectedDireccion && selectedSecretaria) {
        try {
          const data = await dependenciasService.getOficinas(selectedDireccion, selectedSecretaria);
          setOficinas(data);
        } catch (error) {
          console.error('Error al cargar oficinas:', error);
          setOficinas([]);
        }
      }
    };
    loadOficinas();
  }, [selectedDireccion, selectedSecretaria]);

  // Cargar datos del usuario
  useEffect(() => {
    const user = users.find(u => u.id === parseInt(id));
    if (user) {
      const profileVal = user.profile !== undefined && user.profile !== null ? String(user.profile) : '';
      setForm(prev => ({
        ...prev,
        name: user.name,
        ap_paterno: user.ap_paterno || '',
        ap_materno: user.ap_materno || '',
        email: user.email,
        password: user.password,
        repeatPassword: user.password,
        profile: profileVal,
        status: user.status,
        dependencia_id: user.dependencia_id?.toString() || ''
      }));
      setValue('profile', profileVal, { shouldValidate: true });

      // Si el usuario tiene una dependencia, cargamos sus datos
      if (user.dependencia_id) {
        const loadDependenciaData = async () => {
          setIsLoadingDependencias(true);
          try {
            // Obtener la dependencia específica por su ID
            const response = await dependenciasService.getDependenciaById(user.dependencia_id);
            
            if (response?.JsonResponse?.data?.dependencia) {
              const depData = response.JsonResponse.data.dependencia;
              
              // Establecer los valores iniciales
              setSelectedSecretaria(depData.secretaria_id);
              setSelectedDireccion(depData.direccion_id);
              setSelectedOficina(depData.oficina_id);

              // Cargar todas las dependencias necesarias en paralelo
              const [secretariasData, direccionesData, oficinasData] = await Promise.all([
                dependenciasService.getSecretarias(),
                dependenciasService.getDirecciones(depData.secretaria_id),
                dependenciasService.getOficinas(depData.direccion_id, depData.secretaria_id)
              ]);

              // Actualizar los estados con los datos obtenidos
              setSecretarias(secretariasData || []);
              setDirecciones(direccionesData || []);
              setOficinas(oficinasData || []);

            }
          } catch (error) {
            console.error('Error al cargar datos de dependencia:', error);
          } finally {
            setIsLoadingDependencias(false);
          }
        };

        loadDependenciaData();
      }
    }
  }, [id, users]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'secretaria_id') {
      setSelectedSecretaria(value);
      setSelectedDireccion('');
      setSelectedOficina('');
      setDirecciones([]);
      setOficinas([]);
      
      // Cargar nuevas direcciones
      const loadNewDirecciones = async () => {
        try {
          const data = await dependenciasService.getDirecciones(value);
          setDirecciones(data || []);
        } catch (error) {
          console.error('Error al cargar direcciones:', error);
          setDirecciones([]);
        }
      };
      loadNewDirecciones();

      setForm(prev => ({
        ...prev,
        secretaria_id: value,
        direccion_id: '',
        oficina_id: '',
        dependencia_id: ''
      }));
      setValue('secretaria_id', value, { shouldValidate: true });
    } else if (name === 'direccion_id') {
      setSelectedDireccion(value);
      setSelectedOficina('');
      setOficinas([]);
      
      // Cargar nuevas oficinas
      const loadNewOficinas = async () => {
        try {
          const data = await dependenciasService.getOficinas(value, selectedSecretaria);
          setOficinas(data || []);
        } catch (error) {
          console.error('Error al cargar oficinas:', error);
          setOficinas([]);
        }
      };
      loadNewOficinas();

      setForm(prev => ({
        ...prev,
        direccion_id: value,
        oficina_id: '',
        dependencia_id: ''
      }));
      setValue('direccion_id', value, { shouldValidate: true });
    } else if (name === 'oficina_id') {
      setSelectedOficina(value);
      const oficinaSeleccionada = oficinas.find(ofi => ofi.oficina_id === value);
      setForm(prev => ({
        ...prev,
        oficina_id: value,
        dependencia_id: oficinaSeleccionada ? oficinaSeleccionada.id.toString() : ''
      }));
      setValue('oficina_id', value, { shouldValidate: true });
    } else {
      // Convertir a mayúsculas para nombre y apellidos
      const newValue = (name === 'name' || name === 'ap_paterno' || name === 'ap_materno') 
        ? value.toUpperCase() 
        : (type === 'checkbox' ? checked : value);

      setForm(prev => ({
        ...prev,
        [name]: newValue
      }));
      setValue(name, newValue, { shouldValidate: true });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    // Validar que las contraseñas coincidan si se está actualizando la contraseña
    if (form.password && form.password !== form.repeatPassword) {
      Swal.fire({
        title: 'Error',
        text: 'Las contraseñas no coinciden',
        icon: 'error'
      });
      return;
    }
    
    try {
      const userData = { ...form };
      
      // Solo incluir la contraseña si se proporcionó una nueva
      if (!userData.password) {
        delete userData.password;
      } else {
        // Validar longitud mínima de contraseña
        if (userData.password.length < 8) {
          Swal.fire({
            title: 'Error',
            text: 'La contraseña debe tener al menos 8 caracteres',
            icon: 'error'
          });
          return;
        }
      }
      
      // Eliminar el campo de repetición de contraseña antes de enviar
      delete userData.repeatPassword;

      // Convertir a mayúsculas antes de enviar
      userData.name = userData.name.toUpperCase();
      userData.ap_paterno = userData.ap_paterno.toUpperCase();
      userData.ap_materno = userData.ap_materno.toUpperCase();

      // Agregar información de paginación para el backend
      userData.per_page = 50; // Valor por defecto
      userData.search = ''; // Búsqueda vacía por defecto
     
      const result = await dispatch(updateUser({ id: parseInt(id), userData }));
      
      if (result.meta.requestStatus === 'fulfilled') {
        Swal.fire({
          title: '¡Éxito!',
          text: 'Usuario actualizado correctamente',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        navigate('/catalogo-usuarios');
      }
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: error || 'Ocurrió un error al actualizar el usuario',
        icon: 'error'
      });
    }
  };

  return (
    <>
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Editar Usuario</h2>
      
      <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6 bg-blue-100 p-3 sm:p-4 md:p-6 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {/* Nombre */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <input
              type="text"
              name="name"
              id="name"
              value={form.name}
              onChange={handleChange}
              className={`block py-2 sm:py-2.5 px-0 w-full text-base sm:text-lg text-gray-900 uppercase ${!form.name ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 ${errors.name ? 'border-red-500' : 'border-gray-500'} appearance-none focus:outline-none focus:ring-0 focus:border-colorPrimario peer placeholder-transparent`}
              placeholder=" "
              required
              autoComplete="off"
            />
            <label
              htmlFor="name"
              className="peer-focus:font-medium absolute text-base sm:text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 cursor-pointer"
            >
              Nombre
            </label>
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Apellido Paterno */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <input
              type="text"
              name="ap_paterno"
              id="ap_paterno"
              value={form.ap_paterno}
              onChange={handleChange}
              className={`block py-2 sm:py-2.5 px-0 w-full text-base sm:text-lg text-gray-900 uppercase ${!form.ap_paterno ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 ${errors.ap_paterno ? 'border-red-500' : 'border-gray-500'} appearance-none focus:outline-none focus:ring-0 focus:border-colorPrimario peer placeholder-transparent`}
              placeholder=" "
              required
              autoComplete="off"
            />
            <label
              htmlFor="ap_paterno"
              className="peer-focus:font-medium absolute text-base sm:text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 cursor-pointer"
            >
              Apellido Paterno
            </label>
            {errors.ap_paterno && (
              <p className="mt-1 text-sm text-red-600">{errors.ap_paterno.message}</p>
            )}
          </div>

          {/* Apellido Materno */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <input
              type="text"
              name="ap_materno"
              id="ap_materno"
              value={form.ap_materno}
              onChange={handleChange}
              className={`block py-2 sm:py-2.5 px-0 w-full text-base sm:text-lg text-gray-900 uppercase ${!form.ap_materno ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 ${errors.ap_materno ? 'border-red-500' : 'border-gray-500'} appearance-none focus:outline-none focus:ring-0 focus:border-colorPrimario peer placeholder-transparent`}
              placeholder=" "
              required
              autoComplete="off"
            />
            <label
              htmlFor="ap_materno"
              className="peer-focus:font-medium absolute text-base sm:text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 cursor-pointer"
            >
              Apellido Materno
            </label>
            {errors.ap_materno && (
              <p className="mt-1 text-sm text-red-600">{errors.ap_materno.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <input
              type="email"
              name="email"
              id="email"
              value={form.email}
              onChange={handleChange}
              className={`block py-2 sm:py-2.5 px-0 w-full text-base sm:text-lg text-gray-900 ${!form.email ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 ${errors.email ? 'border-red-500' : 'border-gray-500'} appearance-none focus:outline-none focus:ring-0 focus:border-colorPrimario peer placeholder-transparent`}
              placeholder=" "
              required
              autoComplete="off"
            />
            <label
              htmlFor="email"
              className="peer-focus:font-medium absolute text-base sm:text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 cursor-pointer"
            >
              Email
            </label>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Botón para mostrar/ocultar campos de contraseña */}
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowPasswordFields(!showPasswordFields)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
            >
              {showPasswordFields ? (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Ocultar campos de contraseña
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Cambiar contraseña
                </>
              )}
            </button>
          </div>

          {showPasswordFields && (
            <>
              {/* Contraseña */}
              <div className="relative mb-4 sm:mb-6 w-full group">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    value={form.password}
                    onChange={handleChange}
                    className={`block py-2 sm:py-2.5 pr-8 w-full text-base sm:text-lg text-gray-900 bg-transparent border-0 border-b-2 ${errors.password ? 'border-red-500' : 'border-gray-500'} appearance-none focus:outline-none focus:ring-0 focus:border-colorPrimario peer`}
                    placeholder="Nueva contraseña"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
                <label
                  htmlFor="password"
                  className="peer-focus:font-medium absolute text-base sm:text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 cursor-pointer"
                >
                  Nueva Contraseña
                </label>
                {errors.password ? (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                ) : (
                  <p className="mt-1 text-sm text-gray-500">Mínimo 8 caracteres</p>
                )}
              </div>

              {/* Repetir Contraseña */}
              <div className="relative mb-4 sm:mb-6 w-full group">
                <div className="relative">
                  <input
                    type={showRepeatPassword ? "text" : "password"}
                    name="repeatPassword"
                    id="repeatPassword"
                    value={form.repeatPassword}
                    onChange={handleChange}
                    className={`block py-2 sm:py-2.5 pr-8 w-full text-base sm:text-lg text-gray-900 bg-transparent border-0 border-b-2 ${errors.repeatPassword ? 'border-red-500' : 'border-gray-500'} appearance-none focus:outline-none focus:ring-0 focus:border-colorPrimario peer`}
                    placeholder="Repetir nueva contraseña"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                    aria-label={showRepeatPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showRepeatPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
                <label
                  htmlFor="repeatPassword"
                  className="peer-focus:font-medium absolute text-base sm:text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 cursor-pointer"
                >
                  Repetir Contraseña
                </label>
                {errors.repeatPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.repeatPassword.message}</p>
                )}
              </div>
            </>
          )}
          {/* Perfil */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            {(() => {
              const profileOptions = [
                { value: "1", label: "Administrador" },
                { value: "2", label: "Operativo" },
                { value: "3", label: "Enlace" },
              ];
              const selectedProfile = profileOptions.find(o => o.value === String(form.profile)) || null;
              return (
              <CustomSelect
                id="profile"
                name="profile"
                value={selectedProfile}
                onChange={(option) => handleChange({
                  target: {
                    name: 'profile',
                    value: option.value
                  }
                })}
                options={profileOptions}
                isMulti={false}
                placeholder="Seleccione un perfil"
                error={errors.profile}
              />
              );
            })()}
            <label
              htmlFor="profile"
              className="absolute text-base sm:text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0]"
            >
              Perfil
            </label>
            {errors.profile && (
              <p className="mt-1 text-sm text-red-600">{errors.profile.message}</p>
            )}
          </div>

          {/* Estado */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <CustomSelect
              id="status"
              name="status"
              value={{
                value: form.status,
                label: form.status ? "Activo" : "Inactivo"
              }}
              onChange={(option) => handleChange({
                target: {
                  name: 'status',
                  value: option.value
                }
              })}
              options={[
                { value: true, label: "Activo" },
                { value: false, label: "Inactivo" }
              ]}
              isMulti={false}
              placeholder="Seleccione un estado"
            />
            <label
              htmlFor="status"
              className="absolute text-base sm:text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0]"
            >
              Estado
            </label>
          </div>

          {/* Secretaría */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <CustomSelect
              id="secretaria_id"
              name="secretaria_id"
              value={secretarias.find(sec => sec.secretaria_id === selectedSecretaria)
                ? { value: selectedSecretaria, label: secretarias.find(sec => sec.secretaria_id === selectedSecretaria).secretaria }
                : null}
              onChange={(option) => handleChange({
                target: {
                  name: 'secretaria_id',
                  value: option ? option.value : ''
                }
              })}
              options={secretarias.map(sec => ({
                value: sec.secretaria_id,
                label: sec.secretaria
              }))}
              isMulti={false}
              placeholder="Seleccione una secretaría"
              isDisabled={isLoadingDependencias}
              error={errors.secretaria_id}
            />
            <label
              htmlFor="secretaria_id"
              className="absolute text-base sm:text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0]"
            >
              Secretaría
            </label>
            {errors.secretaria_id && (
              <p className="mt-1 text-sm text-red-600">{errors.secretaria_id.message}</p>
            )}
          </div>

          {/* Dirección */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <CustomSelect
              id="direccion_id"
              name="direccion_id"
              value={direcciones.find(dir => dir.direccion_id === selectedDireccion)
                ? { value: selectedDireccion, label: direcciones.find(dir => dir.direccion_id === selectedDireccion).direccion }
                : null}
              onChange={(option) => handleChange({
                target: {
                  name: 'direccion_id',
                  value: option ? option.value : ''
                }
              })}
              options={direcciones.map(dir => ({
                value: dir.direccion_id,
                label: dir.direccion
              }))}
              isMulti={false}
              placeholder="Seleccione una dirección"
              isDisabled={!selectedSecretaria || isLoadingDependencias}
              error={errors.direccion_id}
            />
            <label
              htmlFor="direccion_id"
              className="absolute text-base sm:text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0]"
            >
              Unidad administrativa
            </label>
            {errors.direccion_id && (
              <p className="mt-1 text-sm text-red-600">{errors.direccion_id.message}</p>
            )}
          </div>

          {/* Oficina */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <CustomSelect
              id="oficina_id"
              name="oficina_id"
              value={oficinas.find(ofi => ofi.oficina_id === selectedOficina)
                ? { value: selectedOficina, label: oficinas.find(ofi => ofi.oficina_id === selectedOficina).oficina }
                : null}
              onChange={(option) => handleChange({
                target: {
                  name: 'oficina_id',
                  value: option ? option.value : ''
                }
              })}
              options={oficinas.map(ofi => ({
                value: ofi.oficina_id,
                label: ofi.oficina
              }))}
              isMulti={false}
              placeholder="Seleccione una oficina"
              isDisabled={!selectedDireccion || isLoadingDependencias}
              error={errors.oficina_id}
            />
            <label
              htmlFor="oficina_id"
              className="absolute text-base sm:text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0]"
            >
              Área
            </label>
            {errors.oficina_id && (
              <p className="mt-1 text-sm text-red-600">{errors.oficina_id.message}</p>
            )}
          </div>
          

          {/* Campo oculto para dependencia_id */}
          <input type="hidden" name="dependencia_id" value={form.dependencia_id} />
        </div>

        <div className="flex justify-end space-x-3">
          <SubmitButton
            type="button"
            variant="secondary"
            onClick={() => navigate('/catalogo-usuarios')}
          >
            Cancelar
          </SubmitButton>
          <SubmitButton
            type="submit"
            loading={loading}
          >
            Guardar
          </SubmitButton>
        </div>
      </form>
      {isLoadingDependencias && <LoadingSpinner overlay />}
    </>
  );
};

export default UsuarioEdit; 