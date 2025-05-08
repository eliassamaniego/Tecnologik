import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import NuevoPresupuesto from './pages/NuevoPresupuesto';
import ListaPresupuestos from './pages/ListaPresupuestos';

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
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/nuevo-presupuesto" element={<NuevoPresupuesto />} />
          <Route path="/presupuestos" element={<ListaPresupuestos />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 