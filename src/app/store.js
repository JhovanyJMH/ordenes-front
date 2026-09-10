import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import usersReducer from '../features/users/usersSlice';
import dependenciasReducer from '../features/dependencias/dependenciasSlice';
import adscripcionesReducer from '../features/adscripciones/adscripcionesSlice';
import empleadosReducer from '../features/empleados/empleadosSlice';
import categoriasReducer from '../features/categorias/categoriasSlice';
import serviciosReducer from '../features/servicios/serviciosSlice';
import equiposReducer from '../features/equipos/equiposSlice';
import refaccionesReducer from '../features/refacciones/refaccionesSlice';
import solicitudesReducer from '../features/solicitudes/solicitudesSlice';


export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    dependencias: dependenciasReducer,
    adscripciones: adscripcionesReducer,
    empleados: empleadosReducer,
    categorias: categoriasReducer,
    servicios: serviciosReducer,
    equipos: equiposReducer,
    refacciones: refaccionesReducer,
    solicitudes: solicitudesReducer,
  },
});
