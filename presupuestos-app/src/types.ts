export interface Presupuesto {
  id: string;
  numeroPresupuesto: string;
  fecha: Date;
  vendedorId: string;
  vendedorNombre: string;
  cliente: {
    nombre: string;
    email: string;
    telefono: string;
  };
  descripcion: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  monto: number;
}

export interface Vendedor {
  id: string;
  codigo: string;
  nombre: string;
  email: string;
} 