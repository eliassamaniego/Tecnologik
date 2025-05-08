import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ListAltIcon from '@mui/icons-material/ListAlt';
import DashboardIcon from '@mui/icons-material/Dashboard';

const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Sistema de Presupuestos
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            color="inherit"
            component={RouterLink}
            to="/"
            startIcon={<DashboardIcon />}
          >
            Dashboard
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/nuevo-presupuesto"
            startIcon={<AddCircleOutlineIcon />}
          >
            Nuevo Presupuesto
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/presupuestos"
            startIcon={<ListAltIcon />}
          >
            Presupuestos
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 