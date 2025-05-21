// src/components/PrivateRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Asegúrate de que esta ruta sea correcta

import { CircularProgress, Box, Typography } from '@mui/material';

// Define la interfaz para las props que PrivateRoute espera
interface PrivateRouteProps {
  requiredRole?: 'administrador' | 'vendedor'; // 'requiredRole' es una prop OPCIONAL
}

// El componente PrivateRoute ahora acepta 'requiredRole' como una prop
const PrivateRoute: React.FC<PrivateRouteProps> = ({ requiredRole }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Cargando sesión...</Typography>
      </Box>
    );
  }

  // 1. Si no hay un usuario autenticado, redirige a la página de login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // 2. Si hay un rol requerido y el usuario no tiene ese rol, redirige al dashboard
  // (Asegúrate de que currentUser.rol esté correctamente seteado desde Firestore)
  if (requiredRole && currentUser.rol !== requiredRole) {
    // console.warn(`Acceso denegado: Usuario con rol '${currentUser.rol}' intentó acceder a ruta para '${requiredRole}'`);
    return <Navigate to="/" replace />; // Redirige al dashboard
  }

  // 3. Si hay un usuario y cumple con el rol (o no hay rol requerido), renderiza la ruta anidada
  return <Outlet />;
};

export default PrivateRoute;