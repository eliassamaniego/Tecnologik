import React, { useState } from 'react';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Box from '@mui/material/Box';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Presupuesto } from '../types';

const NuevoPresupuesto = () => {
  const [formData, setFormData] = useState({
    vendedorId: '',
    cliente: {
      nombre: '',
      email: '',
      telefono: '',
    },
    descripcion: '',
    monto: '',
  });

  const generarNumeroPresupuesto = async (vendedorId: string) => {
    const fecha = new Date();
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear().toString().slice(-2);
    
    // Obtener el último número de presupuesto del día para este vendedor
    const presupuestosRef = collection(db, 'presupuestos');
    const q = query(
      presupuestosRef,
      where('vendedorId', '==', vendedorId),
      where('fecha', '>=', new Date(fecha.setHours(0, 0, 0, 0))),
      where('fecha', '<=', new Date(fecha.setHours(23, 59, 59, 999)))
    );
    
    const querySnapshot = await getDocs(q);
    const numeroPresupuesto = (querySnapshot.size + 1).toString().padStart(2, '0');
    
    return `${dia}${mes}${anio}${vendedorId}${numeroPresupuesto}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const numeroPresupuesto = await generarNumeroPresupuesto(formData.vendedorId);
      
      const nuevoPresupuesto: Omit<Presupuesto, 'id'> = {
        numeroPresupuesto,
        fecha: new Date(),
        vendedorId: formData.vendedorId,
        vendedorNombre: '', // Esto debería obtenerse de la base de datos
        cliente: formData.cliente,
        descripcion: formData.descripcion,
        estado: 'pendiente',
        monto: parseFloat(formData.monto),
      };

      await addDoc(collection(db, 'presupuestos'), nuevoPresupuesto);
      alert('Presupuesto creado exitosamente');
      // Limpiar el formulario
      setFormData({
        vendedorId: '',
        cliente: {
          nombre: '',
          email: '',
          telefono: '',
        },
        descripcion: '',
        monto: '',
      });
    } catch (error) {
      console.error('Error al crear el presupuesto:', error);
      alert('Error al crear el presupuesto');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('cliente.')) {
      const clienteField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        cliente: {
          ...prev.cliente,
          [clienteField]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Nuevo Presupuesto
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid xs={12}>
              <TextField
                required
                fullWidth
                label="ID del Vendedor"
                name="vendedorId"
                value={formData.vendedorId}
                onChange={handleChange}
                helperText="Ingrese el código del vendedor (2 dígitos)"
              />
            </Grid>
            <Grid xs={12}>
              <Typography variant="h6" gutterBottom>
                Datos del Cliente
              </Typography>
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Nombre del Cliente"
                name="cliente.nombre"
                value={formData.cliente.nombre}
                onChange={handleChange}
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Email del Cliente"
                name="cliente.email"
                type="email"
                value={formData.cliente.email}
                onChange={handleChange}
              />
            </Grid>
            <Grid xs={12}>
              <TextField
                required
                fullWidth
                label="Teléfono del Cliente"
                name="cliente.telefono"
                value={formData.cliente.telefono}
                onChange={handleChange}
              />
            </Grid>
            <Grid xs={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={4}
                label="Descripción del Presupuesto"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
              />
            </Grid>
            <Grid xs={12}>
              <TextField
                required
                fullWidth
              label="Monto"
                name="monto"
                type="number"
                value={formData.monto}
                onChange={handleChange}
              />
            </Grid>
            <Grid xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                >
                  Crear Presupuesto
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default NuevoPresupuesto; 