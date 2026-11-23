//src\features\branches\infrastructure\datasources\branches-api.datasource.ts

import { apiUrl } from '@/shared/config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Branch } from '../../domain/entities';

export interface BranchPayload {
  name: string;
  address: string;
}

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
    const response = await axios.get<Branch[]>(apiUrl('/branches'), headers);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al cargar las sucursales');
  }
};

// Obtener una sucursal por ID
export const getBranchById = async (id: number): Promise<Branch> => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get<Branch>(apiUrl(`/branches/${id}`), headers);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'No se pudo cargar la información de la sucursal',
    );
  }
};

// Crear una nueva sucursal
export const createBranch = async (data: BranchPayload): Promise<Branch> => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post<Branch>(
      apiUrl('/branches'),
      {
        name: data.name.trim(),
        address: data.address.trim(),
      },
      headers,
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al crear la sucursal');
  }
};


// Actualizar una sucursal existente
export const updateBranch = async (id: number, data: BranchPayload): Promise<Branch> => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.patch<Branch>(
      apiUrl(`/branches/${id}`),
      {
        name: data.name.trim(),
        address: data.address.trim(),
      },
      headers,
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al actualizar la sucursal');
  }
};

// Eliminar una sucursal
export const deleteBranch = async (id: number): Promise<void> => {
  try {
    const headers = await getAuthHeaders();
    await axios.delete(apiUrl(`/branches/${id}`), headers);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'No se pudo eliminar la sucursal');
  }
};