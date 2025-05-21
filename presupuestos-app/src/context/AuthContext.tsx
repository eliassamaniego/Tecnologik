// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase'; // Asegúrate de que 'auth' también se exporte de firebase.ts
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Define la interfaz para la información del usuario que almacenarás en el contexto
interface UserData {
  uid: string;
  email: string | null;
  nombre: string;
  rol: 'administrador' | 'vendedor' | 'invitado'; // 'invitado' para cuando no hay rol definido
  vendedorId?: string; // Opcional, solo para rol 'vendedor'
}

// Define la interfaz para el valor del contexto
interface AuthContextType {
  currentUser: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

// Crea el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Componente proveedor del contexto
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Efecto para escuchar cambios en el estado de autenticación de Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setError(null);
      if (user) {
        try {
          // Si el usuario está autenticado, busca sus datos en Firestore
          const userDocRef = doc(db, 'usuarios', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userDataFromFirestore = userDocSnap.data();
            setCurrentUser({
              uid: user.uid,
              email: user.email,
              nombre: userDataFromFirestore.nombre || user.email, // Usa el nombre de Firestore o el email
              rol: userDataFromFirestore.rol || 'invitado', // Asigna el rol de Firestore
              vendedorId: userDataFromFirestore.vendedorId || undefined,
            });
          } else {
            // Si el usuario existe en Auth pero no en Firestore (ej. recién registrado y no se creó el doc)
            setCurrentUser({
              uid: user.uid,
              email: user.email,
              nombre: user.email || 'Usuario',
              rol: 'invitado',
            });
            console.warn(`Documento de usuario para UID ${user.uid} no encontrado en Firestore.`);
          }
        } catch (err) {
          console.error("Error al obtener datos de usuario de Firestore:", err);
          setError("Error al cargar datos del usuario. Intenta de nuevo.");
          setCurrentUser(null); // Desloguea al usuario si hay un error crítico
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    // Limpia el listener cuando el componente se desmonte
    return unsubscribe;
  }, []);

  // Función para iniciar sesión
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // El onAuthStateChanged se encargará de actualizar el currentUser
    } catch (err: any) {
      console.error("Error en el login:", err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('Email o contraseña incorrectos.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Formato de email inválido.');
      } else {
        setError('Error al iniciar sesión. Intenta de nuevo.');
      }
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await signOut(auth);
      // El onAuthStateChanged se encargará de actualizar el currentUser
    } catch (err: any) {
      console.error("Error al cerrar sesión:", err);
      setError('Error al cerrar sesión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const value = { currentUser, loading, login, logout, error };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children} {/* Solo renderiza los hijos cuando no esté cargando el estado inicial */}
    </AuthContext.Provider>
  );
};