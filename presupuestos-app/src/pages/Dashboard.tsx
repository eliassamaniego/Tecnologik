// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid'; // <-- ¡Asegúrate de esta importación!
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Presupuesto } from '../types';
import CircularProgress from '@mui/material/CircularProgress'; // <-- ¡Asegúrate de importar CircularProgress!
import Alert from '@mui/material/Alert'; // <-- ¡Asegúrate de importar Alert!

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPresupuestos: 0,
    presupuestosPendientes: 0,
    presupuestosAprobados: 0,
    presupuestosRechazados: 0,
    presupuestosPorVendedor: {} as Record<string, number>,
  });
  const [loading, setLoading] = useState(true); // <-- Estado de carga
  const [error, setError] = useState<string | null>(null); // <-- Estado de error

  const cargarEstadisticas = async () => {
    setLoading(true); // <-- Establecer carga a true
    setError(null);   // <-- Limpiar errores anteriores
    try {
      const querySnapshot = await getDocs(collection(db, 'presupuestos'));
      const presupuestos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Presupuesto[];

      const presupuestosPorVendedor: Record<string, number> = {};
      let pendientes = 0;
      let aprobados = 0;
      let rechazados = 0;

      presupuestos.forEach(presupuesto => {
        switch (presupuesto.estado) {
          case 'pendiente':
            pendientes++;
            break;
          case 'aprobado':
            aprobados++;
            break;
          case 'rechazado':
            rechazados++;
            break;
        }

        if (presupuesto.vendedorId) {
            presupuestosPorVendedor[presupuesto.vendedorId] =
            (presupuestosPorVendedor[presupuesto.vendedorId] || 0) + 1;
        } else if (presupuesto.vendedorNombre) {
             presupuestosPorVendedor[presupuesto.vendedorNombre] =
            (presupuestosPorVendedor[presupuesto.vendedorNombre] || 0) + 1;
        }
      });

      setStats({
        totalPresupuestos: presupuestos.length,
        presupuestosPendientes: pendientes,
        presupuestosAprobados: aprobados,
        presupuestosRechazados: rechazados,
        presupuestosPorVendedor,
      });
    } catch (err: any) {
      console.error('Error al cargar estadísticas:', err);
      setError(`Error al cargar estadísticas: ${err.message}`); // <-- Captura y muestra el error
    } finally {
      setLoading(false); // <-- Siempre establece carga a false al final
    }
  };

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const StatCard = ({ title, value, color }: { title: string; value: number; color: string }) => (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        bgcolor: `${color}.light`, 
      }}
    >
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h3" component="div" color={`${color}.main`}>
        {value}
      </Typography>
    </Paper>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      {loading && ( // <-- Renderizado condicional de carga
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
          <Typography ml={2}>Cargando estadísticas...</Typography>
        </Box>
      )}
      {error && ( // <-- Renderizado condicional de error
        <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
      )}
      {!loading && !error && ( // <-- Solo muestra el contenido si no está cargando y no hay error
        <>
          <Grid container spacing={3}> 
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Presupuestos"
                value={stats.totalPresupuestos}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Pendientes"
                value={stats.presupuestosPendientes}
                color="warning"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Aprobados"
                value={stats.presupuestosAprobados}
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Rechazados"
                value={stats.presupuestosRechazados}
                color="error"
              />
            </Grid>
          </Grid>

          <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Presupuestos por Vendedor
            </Typography>
            <Grid container spacing={2}> 
              {Object.entries(stats.presupuestosPorVendedor).map(([vendedorId, cantidad]) => (
                <Grid item xs={12} sm={6} md={4} key={vendedorId}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="subtitle1">
                      Vendedor {vendedorId}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {cantidad}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </>
      )} {/* Cierre del condicional para loading/error */}
    </Container>
  );
};

export default Dashboard;