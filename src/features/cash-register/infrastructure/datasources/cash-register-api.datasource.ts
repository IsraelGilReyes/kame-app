import { apiUrl } from '@/shared/config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { CashRegister } from '../../domain/entites';

export interface OpenCashRegisterPayload {
  branchId: number;
  initialAmount: number;
}

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('@kame_token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Obtener la caja activa de una sucursal (Si da 404, devuelve null limpiamente)
export const getActiveCashRegister = async (
  branchId: number,
): Promise<CashRegister | null> => {
  try {
    const config = await getAuthHeaders();
    const response = await axios.get<CashRegister>(
      apiUrl(`/cash-register/active/${branchId}`),
      config,
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw new Error(error.response?.data?.message || 'Error al verificar la caja activa');
  }
};

// Abrir una nueva caja
export const openCashRegister = async (
  data: OpenCashRegisterPayload,
): Promise<CashRegister> => {
  try {
    const config = await getAuthHeaders();
    const response = await axios.post<CashRegister>(
      apiUrl('/cash-register/open'),
      data,
      config,
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al abrir la caja');
  }
};

// Cerrar una caja existente
export const closeCashRegister = async (id: number): Promise<CashRegister> => {
  try {
    const config = await getAuthHeaders();
    const response = await axios.patch<CashRegister>(
      apiUrl(`/cash-register/${id}/close`),
      {},
      config,
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al cerrar la caja');
  }
};

// Obtener el historial completo de cajas de la sucursal
export const getWeeklyCashRegisters = async (
  branchId: number,
): Promise<CashRegister[]> => {
  try {
    const config = await getAuthHeaders();
    const response = await axios.get<CashRegister[]>(
      apiUrl(`/cash-register/branch/${branchId}`),
      config,
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'No se pudo cargar el historial de cajas',
    );
  }
};