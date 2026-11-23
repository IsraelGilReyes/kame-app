import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiUrl } from '../../../../shared/config/api';
import { loginUser } from '../../infrastructure/datasources/auth-api.datasource';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  branchId?: number;
  branch?: {
    id: number;
    name: string;
    address: string;
  };
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<string>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const signIn = async (email: string, pass: string) => {
    const response = await loginUser({ email, password: pass });

    await AsyncStorage.setItem('@kame_token', response.access_token);
    await AsyncStorage.setItem('@kame_user', JSON.stringify(response.user));

    setToken(response.access_token);
    setUser(response.user);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('@kame_token');
    await AsyncStorage.removeItem('@kame_user');
    setToken(null);
    setUser(null);
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
  ): Promise<string> => {
    const activeToken = token ?? (await AsyncStorage.getItem('@kame_token'));

    if (!activeToken) {
      throw new Error('Tu sesión expiró. Vuelve a iniciar sesión.');
    }

    const res = await fetch(apiUrl('/auth/change-password'), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${activeToken}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message = Array.isArray(data?.message)
        ? data.message[0]
        : data?.message || 'No se pudo cambiar la contraseña.';
      throw new Error(message);
    }

    return data?.message || 'Contraseña actualizada correctamente.';
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, signIn, signOut, changePassword }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);