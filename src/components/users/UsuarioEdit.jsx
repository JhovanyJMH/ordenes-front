import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { updateUser, clearError, clearSuccessMessage, fetchUsers } from '../../features/users/usersSlice';
import { dependenciasService } from '../../services/dependenciasService';
import { useForm } from 'react-hook-form';
import CustomSelect from '../common/CustomSelect';
import Swal from 'sweetalert2';
import SubmitButton from '../common/SubmitButton';
import LoadingSpinner from '../common/LoadingSpinner';
import { FaEye, FaEyeSlash, FaUser, FaBuilding, FaLock, FaEnvelope, FaIdCard } from 'react-icons/fa';

const UsuarioEdit = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { list: users, loading, error, successMessage } = useSelector((state) => state.users);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
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
  // Comenzamos en "false" para que al recargar la página no se quede el spinner infinito
  // Sólo lo pondremos en "true" cuando realmente estemos cargando datos de dependencias.
  const [isLoadingDependencias, setIsLoadingDependencias] = useState(false);
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

  // Cargar usuarios si no están disponibles (solo una vez al montar)
  useEffect(() => {
    const loadUsersIfNeeded = async () => {
      // Si no hay usuarios en la lista y no estamos cargando, cargarlos
      if (users.length === 0 && !loading && !isLoadingUser) {
        setIsLoadingUser(true);
        try {
          await dispatch(fetchUsers({ page: 1, search: '' })).unwrap();
        } catch (error) {
          console.error('Error al cargar usuarios:', error);
          Swal.fire({
            title: 'Error',
            text: 'No se pudieron cargar los datos del usuario',
            icon: 'error'
          });
          navigate('/catalogo-usuarios');
        } finally {
          setIsLoadingUser(false);
        }
      }
    };

    loadUsersIfNeeded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar una vez al montar

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
      } else {
        // Si el usuario no tiene dependencia asociada, nos aseguramos de que no quede el loading activo
        setIsLoadingDependencias(false);
      }
    } else if (users.length > 0 && !isLoadingUser && !loading) {
      // Si ya cargamos usuarios pero no encontramos el usuario con ese ID
      // Solo mostrar error si realmente no está en la lista cargada
      const userStillNotFound = !users.find(u => u.id === parseInt(id));
      if (userStillNotFound) {
        Swal.fire({
          title: 'Usuario no encontrado',
          text: 'El usuario que intentas editar no está en la primera página. Por favor, navega desde la lista de usuarios.',
          icon: 'warning',
          confirmButtonText: 'Volver a la lista'
        }).then(() => {
          navigate('/catalogo-usuarios');
        });
      }
    }
  }, [id, users, setValue, navigate, isLoadingUser, loading]);

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
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Editar Usuario</h2>
          <p className="text-gray-600">Actualice la información del usuario en el sistema</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
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
                    type="text"
                    name="name"
                    id="name"
                    value={form.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border-2 ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-[#8A2036] focus:ring-[#8A2036]/20'} focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 uppercase placeholder-gray-400`}
                    required
                    autoComplete="off"
                    placeholder="Ingrese el nombre"
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
                    type="text"
                    name="ap_paterno"
                    id="ap_paterno"
                    value={form.ap_paterno}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border-2 ${errors.ap_paterno ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-[#8A2036] focus:ring-[#8A2036]/20'} focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 uppercase placeholder-gray-400`}
                    required
                    autoComplete="off"
                    placeholder="Ingrese el apellido paterno"
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
                    type="text"
                    name="ap_materno"
                    id="ap_materno"
                    value={form.ap_materno}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border-2 ${errors.ap_materno ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-[#8A2036] focus:ring-[#8A2036]/20'} focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 uppercase placeholder-gray-400`}
                    required
                    autoComplete="off"
                    placeholder="Ingrese el apellido materno"
                  />
                  {errors.ap_materno && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span className="text-red-500">•</span> {errors.ap_materno.message}
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
              <h3 className="text-lg font-semibold text-white">Credenciales de Acceso</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FaEnvelope className="text-gray-400" size={14} />
                    Correo Electrónico <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={form.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border-2 ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-[#BC955B] focus:ring-[#BC955B]/20'} focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 placeholder-gray-400`}
                    required
                    autoComplete="email"
                    placeholder="ejemplo@correo.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span className="text-red-500">•</span> {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Botón para mostrar/ocultar campos de contraseña */}
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => setShowPasswordFields(!showPasswordFields)}
                    className="inline-flex items-center px-4 py-3 border-2 border-[#BC955B] text-sm font-medium rounded-lg text-[#8A2036] bg-[#BC955B]/10 hover:bg-[#BC955B]/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BC955B] transition-colors duration-200"
                  >
                    {showPasswordFields ? (
                      <>
                        <FaEyeSlash className="w-4 h-4 mr-2" />
                        Ocultar contraseña
                      </>
                    ) : (
                      <>
                        <FaEye className="w-4 h-4 mr-2" />
                        Cambiar contraseña
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Campos de contraseña */}
              {showPasswordFields && (
                <div className="mt-6 space-y-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-md font-medium text-gray-700 mb-2">Cambiar contraseña</h3>
                  <p className="text-sm text-gray-500 mb-4">Deja estos campos en blanco si no deseas cambiar la contraseña.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contraseña */}
                    <div className="space-y-2">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                        <FaLock className="text-gray-400" size={14} />
                        Nueva Contraseña
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          id="password"
                          value={form.password}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 pr-12 rounded-lg border-2 ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-[#BC955B] focus:ring-[#BC955B]/20'} focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 placeholder-gray-400`}
                          placeholder="Mínimo 8 caracteres"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        >
                          {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                        </button>
                      </div>
                      {errors.password ? (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <span className="text-red-500">•</span> {errors.password.message}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500">Mínimo 8 caracteres</p>
                      )}
                    </div>

                    {/* Repetir Contraseña */}
                    <div className="space-y-2">
                      <label htmlFor="repeatPassword" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                        <FaLock className="text-gray-400" size={14} />
                        Confirmar Contraseña
                      </label>
                      <div className="relative">
                        <input
                          type={showRepeatPassword ? "text" : "password"}
                          name="repeatPassword"
                          id="repeatPassword"
                          value={form.repeatPassword}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 pr-12 rounded-lg border-2 ${errors.repeatPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-[#BC955B] focus:ring-[#BC955B]/20'} focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 placeholder-gray-400`}
                          placeholder="Confirma la nueva contraseña"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                          onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                          aria-label={showRepeatPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        >
                          {showRepeatPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                        </button>
                      </div>
                      {errors.repeatPassword && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <span className="text-red-500">•</span> {errors.repeatPassword.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Role and Organizational Information Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-[#DAC19A] to-[#B8A078] px-6 py-4 flex items-center gap-3">
              <FaBuilding className="text-white text-xl" />
              <h3 className="text-lg font-semibold text-white">Rol y Organización</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Perfil */}
                <div className="space-y-2">
                  <label htmlFor="profile" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FaUser className="text-gray-400" size={14} />
                    Perfil <span className="text-red-500">*</span>
                  </label>
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
                  {errors.profile && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span className="text-red-500">•</span> {errors.profile.message}
                    </p>
                  )}
                </div>

                {/* Estado */}
                <div className="space-y-2">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FaUser className="text-gray-400" size={14} />
                    Estado
                  </label>
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
                </div>

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
                  {errors.oficina_id && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span className="text-red-500">•</span> Este campo es requerido
                    </p>
                  )}
                </div>

                {/* Campo oculto para dependencia_id */}
                <input type="hidden" name="dependencia_id" value={form.dependencia_id} />
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
              className="w-full sm:w-auto px-8 py-3 rounded-lg bg-gradient-to-r from-[#8A2036] to-[#6B1829] text-white hover:from-[#6B1829] hover:to-[#5A1223] focus:outline-none focus:ring-2 focus:ring-[#8A2036]/30 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              Guardar Cambios
            </SubmitButton>
          </div>
        </form>
        {(isLoadingDependencias || isLoadingUser || (users.length === 0 && loading)) && <LoadingSpinner overlay />}
      </div>
    </>
  );
};

export default UsuarioEdit;