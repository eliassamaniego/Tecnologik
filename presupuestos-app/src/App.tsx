// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import NuevoPresupuesto from './pages/NuevoPresupuesto';
import ListaPresupuestos from './pages/ListaPresupuestos';
import LoginPage from './pages/LoginPage';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import AdminPage from './pages/AdminPage'; // <-- ¡Importa la nueva página de administración!

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Rutas Protegidas que requieren login (cualquier rol) */}
            <Route element={<PrivateRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/nuevo-presupuesto" element={<NuevoPresupuesto />} />
              <Route path="/presupuestos" element={<ListaPresupuestos />} />
            </Route>

            {/* Ruta Protegida ESPECÍFICA PARA ADMINISTRADORES */}
            <Route element={<PrivateRoute requiredRole="administrador" />}> {/* <-- ¡Aquí el rol requerido! */}
              <Route path="/admin" element={<AdminPage />} />
            </Route>

            {/* Considera una ruta 404 */}
            {/* <Route path="*" element={<NotFoundPage />} /> */}
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;