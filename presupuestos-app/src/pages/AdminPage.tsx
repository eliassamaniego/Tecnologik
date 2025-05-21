// src/pages/AdminPage.tsx
import React from 'react';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useAuth } from '../context/AuthContext'; // Para mostrar info del admin

const AdminPage: React.FC = () => {
  const { currentUser } = useAuth(); // Obtenemos la info del usuario actual

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Panel de Administración
        </Typography>
        <Typography variant="body1">
          Bienvenido, {currentUser?.nombre} (Rol: {currentUser?.rol}).
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6">
            Contenido exclusivo para Administradores:
          </Typography>
          <ul>
            <li>Gestión de Usuarios (futuro)</li>
            <li>Informes avanzados (futuro)</li>
            <li>Configuración del sistema (futuro)</li>
            <li>Modificacion de presupuesto (futuro)</li>
            <li>Reportes administrativos (futuro)</li>
            <li>Mensajes programados, automaticos, manuales para vendedores (futuro)</li>
          </ul>
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminPage;