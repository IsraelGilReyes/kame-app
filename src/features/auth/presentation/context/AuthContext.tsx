import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { loginUser } from '../../infrastructure/datasources/auth-api.datasource';

interface User {
  id: number; // Coincide con tu backend (número)
  name: string;
  email: string;
  role: string;
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Al abrir la app, revisamos si ya hay una sesión guardada
  useEffect(() => {
    const loadStoredSession = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('@kame_token');
        const storedUser = await AsyncStorage.getItem('@kame_user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error('Error al cargar la sesión', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredSession();
  }, []);

  // Función de inicio de sesión conectada a tu backend
  const signIn = async (email: string, pass: string) => {
    const response = await loginUser({ email, password: pass });

    // Corrección: Usamos access_token en lugar de token
    await AsyncStorage.setItem('@kame_token', response.access_token);
    await AsyncStorage.setItem('@kame_user', JSON.stringify(response.user));

    setToken(response.access_token);
    setUser(response.user);
  };

  // Función para cerrar sesión
  const signOut = async () => {
    await AsyncStorage.removeItem('@kame_token');
    await AsyncStorage.removeItem('@kame_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para consumir el contexto fácilmente en cualquier pantalla
export const useAuth = () => useContext(AuthContext);