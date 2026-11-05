import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { CashRegister } from '../../domain/entites';


const API_URL = 'http://localhost:3000'; 

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('@kame_token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Obtener la caja activa de una sucursal (Si da 404, devuelve null limpiamente)
export const getActiveCashRegister = async (branchId: number): Promise<CashRegister | null> => {
  try {
    const config = await getAuthHeaders();
    const response = await axios.get<CashRegister>(`${API_URL}/cash-register/active/${branchId}`, config);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null; // Significa que no hay caja abierta actualmente
    }
    throw new Error(error.response?.data?.message || 'Error al verificar la caja activa');
  }
};

// Abrir una nueva caja
export const openCashRegister = async (data: { branchId: number; initialAmount: number }): Promise<CashRegister> => {
  try {
    const config = await getAuthHeaders();
    const response = await axios.post<CashRegister>(`${API_URL}/cash-register/open`, data, config);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al abrir la caja');
  }
};

// Cerrar una caja existente
export const closeCashRegister = async (id: number): Promise<CashRegister> => {
  try {
    const config = await getAuthHeaders();
    const response = await axios.patch<CashRegister>(`${API_URL}/cash-register/${id}/close`, {}, config);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al cerrar la caja');
  }
};

// Obtener el historial completo de cajas de la sucursal para la vista semanal
export const getWeeklyCashRegisters = async (branchId: number): Promise<CashRegister[]> => {
  try {
    const config = await getAuthHeaders();
    const response = await axios.get<CashRegister[]>(`${API_URL}/cash-register/branch/${branchId}`, config);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'No se pudo cargar el historial de cajas');
  }
};