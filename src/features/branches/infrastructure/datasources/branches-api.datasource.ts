import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Branch } from '../../domain/entities';

const API_URL = 'http://localhost:3000'; // Ajusta la URL de tu backend si es necesario

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('@kame_token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Obtener todas las sucursales
export const getBranches = async (): Promise<Branch[]> => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get<Branch[]>(`${API_URL}/branches`, headers);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al cargar las sucursales');
  }
};

// Crear una nueva sucursal (Principalmente para Gerentes)
export const createBranch = async (data: { name: string; address: string }): Promise<Branch> => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post<Branch>(`${API_URL}/branches`, data, headers);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al crear la sucursal');
  }
};