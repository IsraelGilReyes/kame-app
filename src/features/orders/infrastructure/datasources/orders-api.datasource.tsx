import { apiUrl } from '@/shared/config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Order } from '../../domain/entities';


const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('@kame_token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// 1. Obtener todas las órdenes
export const getOrders = async (): Promise<Order[]> => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get<Order[]>(apiUrl('/orders'), headers);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al obtener órdenes');
  }
};

// 2. Obtener una orden específica por su ID
export const getOrderById = async (id: number): Promise<Order> => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get<Order>(apiUrl(`/orders/${id}`), headers);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al obtener la orden');
  }
};

// 3. Crear una nueva orden
export const createOrder = async (orderData: Partial<Order>): Promise<Order> => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post<Order>(apiUrl('/orders'), orderData, headers);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al crear orden');
  }
};

// 4. Actualizar el estado de una orden (ej. de PENDIENTE a COCINA, ENVIADO, etc.)
export const updateOrderStatus = async (id: number, statusData: { status: string }): Promise<Order> => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.patch<Order>(apiUrl(`/orders/${id}/status`), statusData, headers);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al actualizar el estado de la orden');
  }
};