// src/pages/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Importa el hook de autenticación

import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert'; // Para mostrar mensajes de error/éxito
import CircularProgress from '@mui/material/CircularProgress'; // Para el spinner de carga

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, currentUser, loading, error } = useAuth(); // Obtiene las funciones y el estado del contexto
  const [loginSuccess, setLoginSuccess] = useState(false); // Estado para el mensaje de éxito
  const navigate = useNavigate();

  // Redirige si el usuario ya está logueado
  useEffect(() => {
    if (currentUser) {
      // Redirige a la página principal o dashboard después de un inicio de sesión exitoso
      navigate('/', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginSuccess(false); // Reinicia el estado de éxito al intentar iniciar sesión
    try {
      await login(email, password);
      // El useEffect anterior se encargará de la redirección si el login es exitoso
      setLoginSuccess(true); // Solo para mostrar un mensaje temporal si no hay redirección instantánea
    } catch (err) {
      // El error ya se maneja y se guarda en el contexto, se mostrará automáticamente
      setLoginSuccess(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Iniciar Sesión
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Correo Electrónico"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Contraseña"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress />
            </Box>
          )}

          {error && !loading && ( // Muestra el error del contexto si no está cargando
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {loginSuccess && !loading && !error && (
            <Alert severity="success" sx={{ mt: 2 }}>
              ¡Inicio de sesión exitoso! Redireccionando...
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading} // Deshabilita el botón mientras carga
          >
            Iniciar Sesión
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;