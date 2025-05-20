import React, { useState, useEffect } from 'react'; // Agregamos useEffect
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress'; // Para el spinner de carga
import Autocomplete from '@mui/material/Autocomplete'; // Para el campo de selección de vendedor

import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Presupuesto } from '../types';

// Definimos una interfaz para el vendedor (si no la tienes en types.ts)
interface Vendedor {
  id: string;
  nombre: string;
  email?: string; // Opcional
}

const NuevoPresupuesto = () => {
  const [formData, setFormData] = useState({
    vendedorId: '',
    vendedorNombre: '', // Agregamos este campo para almacenar el nombre del vendedor seleccionado
    cliente: {
      nombre: '',
      email: '',
      telefono: '',
    },
    descripcion: '',
    monto: '',
  });

  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [cargandoVendedores, setCargandoVendedores] = useState(true);
  const [errorCargaVendedores, setErrorCargaVendedores] = useState<string | null>(null);

  // **** Nuevo useEffect para cargar los vendedores ****
  useEffect(() => {
    const cargarVendedores = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'vendedores'));
        const vendedoresData: Vendedor[] = querySnapshot.docs.map(doc => ({
          id: doc.id, // O asume que el ID del documento es el ID del vendedor si no tienes un campo 'id'
          ...doc.data() as Omit<Vendedor, 'id'> // Castea los datos del documento
        }));
        setVendedores(vendedoresData);
        setCargandoVendedores(false);
      } catch (error) {
        console.error('Error al cargar vendedores:', error);
        setErrorCargaVendedores('Error al cargar la lista de vendedores.');
        setCargandoVendedores(false);
      }
    };
    cargarVendedores();
  }, []);

  const generarNumeroPresupuesto = async (vendedorId: string) => {
    const fechaActual = new Date();
    const dia = fechaActual.getDate().toString().padStart(2, '0');
    const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
    const anio = fechaActual.getFullYear().toString().slice(-2);

    const inicioDelDia = new Date(fechaActual);
    inicioDelDia.setHours(0, 0, 0, 0);

    const finDelDia = new Date(fechaActual);
    finDelDia.setHours(23, 59, 59, 999);

    const presupuestosRef = collection(db, 'presupuestos');
    const q = query(
      presupuestosRef,
      where('vendedorId', '==', vendedorId),
      where('fecha', '>=', inicioDelDia),
      where('fecha', '<=', finDelDia)
    );

    try {
      const querySnapshot = await getDocs(q);
      const numeroPresupuestoDelDia = (querySnapshot.size + 1).toString().padStart(2, '0');

      return `${dia}${mes}${anio}${vendedorId}${numeroPresupuestoDelDia}`;
    } catch (error) {
      console.error("Error al generar el número de presupuesto:", error);
      throw new Error("No se pudo generar el número de presupuesto. Verifica el índice en Firebase.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.vendedorId || !formData.cliente.nombre || !formData.descripcion || !formData.monto) {
        alert('Por favor, completa todos los campos requeridos.');
        return;
      }
      if (isNaN(parseFloat(formData.monto))) {
        alert('El monto debe ser un número válido.');
        return;
      }

      const numeroPresupuesto = await generarNumeroPresupuesto(formData.vendedorId);

      const nuevoPresupuesto: Omit<Presupuesto, 'id'> = {
        numeroPresupuesto,
        fecha: new Date(),
        vendedorId: formData.vendedorId,
        vendedorNombre: formData.vendedorNombre, // Usamos el nombre del vendedor del estado
        cliente: formData.cliente,
        descripcion: formData.descripcion,
        estado: 'pendiente',
        monto: parseFloat(formData.monto),
      };

      await addDoc(collection(db, 'presupuestos'), nuevoPresupuesto);
      alert('Presupuesto creado exitosamente');
      setFormData({
        vendedorId: '',
        vendedorNombre: '',
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
      alert('Error al crear el presupuesto: ' + (error as Error).message);
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
              {/* **** Autocomplete para Vendedor **** */}
              {cargandoVendedores ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress />
                  <Typography ml={2}>Cargando vendedores...</Typography>
                </Box>
              ) : errorCargaVendedores ? (
                <Typography color="error">{errorCargaVendedores}</Typography>
              ) : (
                <Autocomplete
                  options={vendedores}
                  getOptionLabel={(option) => option.nombre}
                  onChange={(event, newValue) => {
                    setFormData(prev => ({
                      ...prev,
                      vendedorId: newValue ? newValue.id : '',
                      vendedorNombre: newValue ? newValue.nombre : '',
                    }));
                  }}
                  value={vendedores.find(v => v.id === formData.vendedorId) || null}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      fullWidth
                      label="Selecciona Vendedor"
                      helperText="Selecciona un vendedor de la lista"
                    />
                  )}
                />
              )}
            </Grid>
            {/* ... El resto de tus campos del formulario ... */}
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
                inputProps={{ step: "0.01" }}
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