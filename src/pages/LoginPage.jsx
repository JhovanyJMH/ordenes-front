import { useMemo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { loginUser } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import LogoEdoMex from "../images/logos_edomex3.png";
import LogoEsc from "../images/escudo-edomex-bl.png";
import FondoUno from "../images/fondo_uno.png";
import FondoDos from "../images/fondo_dos.png";
import FondoTres from "../images/fondo_tres.png";
import Swal from "sweetalert2";

const AnimatedShapes = () => {
  return (
    <div className="w-full h-full relative overflow-hidden bg-transparent">
      <style>
        {`
          @keyframes float-doc {
            0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
            20% { transform: translateY(-40px) rotate(10deg) scale(1.2); }
            40% { transform: translateY(-20px) rotate(-8deg) scale(1.1); }
            60% { transform: translateY(-50px) rotate(12deg) scale(1.25); }
            80% { transform: translateY(-25px) rotate(-5deg) scale(1.15); }
          }
          @keyframes float-calendar {
            0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
            20% { transform: translateY(-35px) rotate(-12deg) scale(1.18); }
            40% { transform: translateY(-45px) rotate(15deg) scale(1.25); }
            60% { transform: translateY(-25px) rotate(-10deg) scale(1.12); }
            80% { transform: translateY(-40px) rotate(8deg) scale(1.2); }
          }
          @keyframes float-clipboard {
            0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
            20% { transform: translate(35px, -35px) scale(1.2) rotate(12deg); }
            40% { transform: translate(20px, -50px) scale(1.25) rotate(-15deg); }
            60% { transform: translate(-25px, -30px) scale(1.18) rotate(10deg); }
            80% { transform: translate(-15px, -40px) scale(1.15) rotate(-8deg); }
          }
          @keyframes float-checklist {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            25% { transform: translateY(-50px) rotate(20deg); }
            50% { transform: translateY(-30px) rotate(-25deg); }
            75% { transform: translateY(-45px) rotate(15deg); }
          }
          @keyframes float-order {
            0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
            20% { transform: translate(30px, -40px) scale(1.22) rotate(18deg); }
            40% { transform: translate(-20px, -55px) scale(1.28) rotate(-20deg); }
            60% { transform: translate(-35px, -25px) scale(1.2) rotate(15deg); }
            80% { transform: translate(-30px, -45px) scale(1.18) rotate(-12deg); }
          }
          .animate-float-doc { animation: float-doc 8s ease-in-out infinite; }
          .animate-float-calendar { animation: float-calendar 12s ease-in-out infinite; }
          .animate-float-clipboard { animation: float-clipboard 10s ease-in-out infinite; }
          .animate-float-checklist { animation: float-checklist 7s ease-in-out infinite; }
          .animate-float-order { animation: float-order 11s ease-in-out infinite; }
        `}
      </style>

      <div className="absolute inset-0">
        {/* Document icon */}
        <svg className="animate-float-doc absolute top-16 left-16 w-28 h-28 opacity-15" viewBox="0 0 24 24" fill="none" stroke="#8A2036" strokeWidth="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <line x1="10" y1="9" x2="8" y2="9" />
        </svg>

        {/* Calendar icon */}
        <svg className="animate-float-calendar absolute top-1/4 right-20 w-36 h-36 opacity-10" viewBox="0 0 24 24" fill="none" stroke="#BC955B" strokeWidth="1.5">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <rect x="8" y="14" width="2" height="2" />
          <rect x="14" y="14" width="2" height="2" />
          <rect x="8" y="18" width="2" height="2" />
          <rect x="14" y="18" width="2" height="2" />
        </svg>

        {/* Clipboard icon */}
        <svg className="animate-float-clipboard absolute bottom-24 right-24 w-32 h-32 opacity-12" viewBox="0 0 24 24" fill="none" stroke="#DAC19A" strokeWidth="1.5">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          <path d="M9 14h6" />
          <path d="M9 10h6" />
          <path d="M9 18h6" />
        </svg>


        {/* Order icon */}
        <svg className="animate-float-order absolute bottom-16 right-1/4 w-26 h-26 opacity-15" viewBox="0 0 24 24" fill="none" stroke="#8A2036" strokeWidth="1.5">
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
          <path d="M9 14l2 2 4-4" />
        </svg>
      </div>
    </div>
  );
};

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const currentYear = new Date().getFullYear();

  const backgroundImages = [FondoUno, FondoDos, FondoTres];

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const result = await dispatch(loginUser(data));
    if (result.meta.requestStatus === "fulfilled") {
      Swal.fire({
        icon: "success",
        title: "Inicio de sesión exitoso",
        showConfirmButton: false,
        timer: 1500,
      });
      navigate("/dashboard");
    } else {
      if (result.payload === null) return;
      const errorMessage = result.payload || result.error?.message || "Error al iniciar sesión";
      Swal.fire({
        icon: "error",
        title: errorMessage,
        text: "Por favor verifica tus datos e intenta nuevamente.",
      });
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4" style={{ backgroundImage: `url(${backgroundImages[currentBgIndex]})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', transition: 'background-image 1s ease-in-out' }}>
      <div className="grid grid-cols-1 lg:grid-cols-2 w-full max-w-7xl min-h-[600px] backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl border border-white/30">
        {/* Left Panel - Decorative */}
        <div className="hidden lg:block relative overflow-hidden">
          <AnimatedShapes />
          <div className="absolute inset-0 flex flex-col justify-between p-12 z-10">
            <div>
              <h1 className="text-4xl font-bold text-colorPrimario mb-4">Sistema de Órdenes de Servicio</h1>
              <p className="text-gray-600 text-lg">Versión 2.0</p>
            </div>
            
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="flex flex-col justify-center p-8 lg:p-16 bg-white border-l-4 border-colorPrimario">
          {/* Logos */}
          <div className="flex justify-center gap-4 mb-8 bg-colorPrimario p-4 rounded-xl">
            <img className="w-10 h-auto lg:w-20" src={LogoEsc} alt="Logo Escudo" />
            <img className="w-10 h-auto lg:w-20" src={LogoEdoMex} alt="Logo Edomex" />
          </div>

          <div className="max-w-md mx-auto w-full">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-colorPrimario mb-2">Bienvenido</h2>
              <p className="text-colorSecundario">Ingresa tus credenciales para acceder</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-colorPrimario block">
                  Usuario
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-colorSecundario" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="email"
                    className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${
                      errors.email?.message ? 'border-colorAuxiliar focus:border-colorAuxiliar' : 'border-gray-300 focus:border-colorSecundario'
                    } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-colorSecundario/20 transition-all duration-200`}
                    placeholder="correo@ejemplo.com"
                    autoComplete="off"
                    {...register("email", {
                      required: "Este campo es necesario",
                    })}
                  />
                </div>
                {errors.email?.message && (
                  <p className="text-colorAuxiliar text-sm">{errors.email.message}</p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-colorPrimario block">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-colorSecundario" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className={`w-full pl-10 pr-12 py-3 bg-gray-50 border ${
                      errors.password?.message ? 'border-colorAuxiliar focus:border-colorAuxiliar' : 'border-gray-300 focus:border-colorSecundario'
                    } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-colorSecundario/20 transition-all duration-200`}
                    placeholder="••••••••"
                    autoComplete="off"
                    {...register("password", {
                      required: "Este campo es necesario",
                      minLength: {
                        value: 4,
                        message: "Tu contraseña debe tener al menos 4 caracteres"
                      }
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-colorSecundario transition-colors"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password?.message && (
                  <p className="text-colorAuxiliar text-sm">{errors.password.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-colorSecundario hover:bg-colorSecundario/90 text-white font-semibold rounded-xl shadow-lg shadow-colorSecundario /25 focus:outline-none focus:ring-2 focus:ring-colorSecundario focus:ring-offset-2 focus:ring-offset-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cargando...
                  </span>
                ) : (
                  "Iniciar Sesión"
                )}
              </button>
            </form>

            {/* Desktop Footer */}
            <div className="hidden lg:block mt-8 pt-6 border-t border-colorTerciario">
              <p className="text-colorSecundario text-sm text-center">
                Secretaría de Bienestar
              </p>
              <p className="text-gray-500 text-sm text-center">
                © {currentYear} Dirección General de Desarrollo Institucional y Tecnologías de la Información
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
