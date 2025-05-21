// src/pages/ListaPresupuestos.tsx
import React, { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
// Importa Grid de Unstable_Grid2 para consistencia con otros archivos si lo estabas usando así
import Grid from '@mui/material/Unstable_Grid2'; // <-- ¡Asegúrate de que sea esta importación si usabas Unstable_Grid2!
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import { collection, getDocs, doc, updateDoc, query, where, QueryConstraint } from 'firebase/firestore';
import { db } from '../firebase';
import { Presupuesto } from '../types';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

// Para DatePicker
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns'; // Para formatear fechas para la búsqueda

const ListaPresupuestos = () => {
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  const [loading, setLoading] = useState(true); // Estado de carga
  const [error, setError] = useState<string | null>(null); // Estado de error

  // **** Estados para los filtros ****
  const [filterCliente, setFilterCliente] = useState('');
  const [filterVendedorId, setFilterVendedorId] = useState('');
  const [filterMontoMin, setFilterMontoMin] = useState('');
  const [filterMontoMax, setFilterMontoMax] = useState('');
  const [filterFechaInicio, setFilterFechaInicio] = useState<Date | null>(null);
  const [filterFechaFin, setFilterFechaFin] = useState<Date | null>(null);

  const cargarPresupuestos = async () => {
    setLoading(true);
    setError(null);
    try {
      let q = collection(db, 'presupuestos');
      const queryConstraints: QueryConstraint[] = [];

      if (filterCliente) {
        queryConstraints.push(where('cliente.nombre', '==', filterCliente));
      }
      if (filterVendedorId) {
        queryConstraints.push(where('vendedorId', '==', filterVendedorId));
      }
      if (filterMontoMin) {
        queryConstraints.push(where('monto', '>=', parseFloat(filterMontoMin)));
      }
      if (filterMontoMax) {
        queryConstraints.push(where('monto', '<=', parseFloat(filterMontoMax)));
      }
      if (filterFechaInicio) {
        const startOfDay = new Date(filterFechaInicio.setHours(0, 0, 0, 0));
        queryConstraints.push(where('fecha', '>=', startOfDay));
      }
      if (filterFechaFin) {
        const endOfDay = new Date(filterFechaFin.setHours(23, 59, 59, 999));
        queryConstraints.push(where('fecha', '<=', endOfDay));
      }

      const finalQuery = queryConstraints.length > 0 ? query(q, ...queryConstraints) : q;
      const querySnapshot = await getDocs(finalQuery);

      const presupuestosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Presupuesto[];
      setPresupuestos(presupuestosData);
    } catch (err: any) {
      console.error('Error al cargar presupuestos:', err);
      setError(`Error al cargar presupuestos: ${err.message}. Asegúrate de tener los índices necesarios en Firebase.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPresupuestos();
  }, []);

  const handleApplyFilters = () => {
    cargarPresupuestos();
  };

  const handleClearFilters = () => {
    setFilterCliente('');
    setFilterVendedorId('');
    setFilterMontoMin('');
    setFilterMontoMax('');
    setFilterFechaInicio(null);
    setFilterFechaFin(null);
    cargarPresupuestos();
  };

  const actualizarEstado = async (id: string, nuevoEstado: 'aprobado' | 'rechazado') => {
    try {
      const presupuestoRef = doc(db, 'presupuestos', id);
      await updateDoc(presupuestoRef, { estado: nuevoEstado });
      await cargarPresupuestos();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      alert('Error al actualizar estado');
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'aprobado':
        return 'success';
      case 'rechazado':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Lista de Presupuestos
        </Typography>

        {/* **** Sección de Filtros **** */}
        <Box sx={{ mb: 4, p: 2, border: '1px solid #ccc', borderRadius: '4px' }}>
          <Typography variant="h6" gutterBottom>
            Filtros de Búsqueda
          </Typography>
          <Grid container spacing={2}> {/* Usamos Grid de Unstable_Grid2 */}
            <Grid xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Cliente (exacto)"
                value={filterCliente}
                onChange={(e) => setFilterCliente(e.target.value)}
                size="small"
              />
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="ID Vendedor (exacto)"
                value={filterVendedorId}
                onChange={(e) => setFilterVendedorId(e.target.value)}
                size="small"
              />
            </Grid>
            <Grid xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Monto Mín."
                type="number"
                value={filterMontoMin}
                onChange={(e) => setFilterMontoMin(e.target.value)}
                size="small"
              />
            </Grid>
            <Grid xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Monto Máx."
                type="number"
                value={filterMontoMax}
                onChange={(e) => setFilterMontoMax(e.target.value)}
                size="small"
              />
            </Grid>
            <Grid xs={12} sm={6} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Fecha Inicio"
                  value={filterFechaInicio}
                  onChange={(newValue) => setFilterFechaInicio(newValue)}
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid xs={12} sm={6} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Fecha Fin"
                  value={filterFechaFin}
                  onChange={(newValue) => setFilterFechaFin(newValue)}
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid xs={12} md={4} sx={{ display: 'flex', gap: 1, mt: { xs: 2, md: 0 } }}>
              <Button
                variant="contained"
                onClick={handleApplyFilters}
                sx={{ flexGrow: 1 }}
              >
                Buscar
              </Button>
              <Button
                variant="outlined"
                onClick={handleClearFilters}
                sx={{ flexGrow: 1 }}
              >
                Limpiar
              </Button>
            </Grid>
          </Grid>
        </Box>
        {/* **** Fin Sección de Filtros **** */}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
            <Typography ml={2}>Cargando presupuestos...</Typography>
          </Box>
        )}
        {error && (
          <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
        )}
        {!loading && presupuestos.length === 0 && !error && (
          <Typography variant="body1" sx={{ my: 2 }}>
            No se encontraron presupuestos con los filtros aplicados.
          </Typography>
        )}
        {!loading && presupuestos.length > 0 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Número</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Vendedor</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Monto</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {presupuestos.map((presupuesto) => (
                  <TableRow key={presupuesto.id}>
                    <TableCell>{presupuesto.numeroPresupuesto}</TableCell>
                    <TableCell>
                      {
                        presupuesto.fecha && typeof presupuesto.fecha === 'object' && 'toDate' in presupuesto.fecha
                          ? (presupuesto.fecha as any).toDate().toLocaleDateString()
                          : (presupuesto.fecha ? new Date(presupuesto.fecha).toLocaleDateString() : 'N/A')
                      }
                    </TableCell>
                    <TableCell>{presupuesto.vendedorNombre}</TableCell>
                    <TableCell>{presupuesto.cliente.nombre}</TableCell>
                    <TableCell>{presupuesto.descripcion}</TableCell>
                    <TableCell>${presupuesto.monto?.toLocaleString() || '0'}</TableCell>
                    <TableCell>
                      <Chip
                        label={presupuesto.estado}
                        color={getEstadoColor(presupuesto.estado)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          color="success"
                          onClick={() => actualizarEstado(presupuesto.id, 'aprobado')}
                          disabled={presupuesto.estado === 'aprobado'}
                        >
                          <CheckCircleOutlineIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => actualizarEstado(presupuesto.id, 'rechazado')}
                          disabled={presupuesto.estado === 'rechazado'}
                        >
                          <CancelOutlinedIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default ListaPresupuestos;