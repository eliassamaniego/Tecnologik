// src/components/Navbar.tsx
import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { currentUser, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      alert('Error al cerrar sesión. Intenta de nuevo.');
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            Tecnologik App
          </Link>
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {!loading && currentUser && (
            <>
              <Button color="inherit" component={Link} to="/">
                Dashboard
              </Button>
              <Button color="inherit" component={Link} to="/nuevo-presupuesto">
                Nuevo Presupuesto
              </Button>
              <Button color="inherit" component={Link} to="/presupuestos">
                Lista Presupuestos
              </Button>
              {/* ¡Muestra este botón SOLO si el rol es administrador! */}
              {/* ¡Modificación aquí para el botón de Administración! */}
              {currentUser.rol === 'administrador' && (
                <Button
                  variant="contained" // Le da un fondo al botón
                  color="secondary"   // Usa el color secundario de tu tema
                  component={Link}
                  to="/admin"
                  sx={{ ml: 1 }} // Margen izquierdo para separarlo un poco
                >
                  Administración
                </Button>
              )}
              <Button color="inherit" onClick={handleLogout} sx={{ ml: 2 }}>
                Cerrar Sesión ({currentUser.nombre || currentUser.email}) {/* Muestra el nombre o email */}
              </Button>
            </>
          )}
          {!loading && !currentUser && (
            <Button color="inherit" component={Link} to="/login">
              Iniciar Sesión
            </Button>
          )}
        </Box>    
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;