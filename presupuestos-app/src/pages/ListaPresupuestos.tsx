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
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Presupuesto } from '../types';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

const ListaPresupuestos = () => {
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);

  const cargarPresupuestos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'presupuestos'));
      const presupuestosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Presupuesto[];
      setPresupuestos(presupuestosData);
    } catch (error) {
      console.error('Error al cargar presupuestos:', error);
    }
  };

  useEffect(() => {
    cargarPresupuestos();
  }, []);

  const actualizarEstado = async (id: string, nuevoEstado: 'aprobado' | 'rechazado') => {
    try {
      const presupuestoRef = doc(db, 'presupuestos', id);
      await updateDoc(presupuestoRef, { estado: nuevoEstado });
      await cargarPresupuestos();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
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
                      presupuesto.fecha instanceof Date
                        ? presupuesto.fecha.toLocaleDateString()
                        : typeof presupuesto.fecha === 'object' && presupuesto.fecha !== null && 'toDate' in presupuesto.fecha
                          ? (presupuesto.fecha as any).toDate().toLocaleDateString()
                          : new Date(presupuesto.fecha).toLocaleDateString()
                    }
                  </TableCell>
                  <TableCell>{presupuesto.vendedorNombre}</TableCell>
                  <TableCell>{presupuesto.cliente.nombre}</TableCell>
                  <TableCell>{presupuesto.descripcion}</TableCell>
                  <TableCell>${presupuesto.monto.toLocaleString()}</TableCell>
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
      </Paper>
    </Container>
  );
};

export default ListaPresupuestos; 