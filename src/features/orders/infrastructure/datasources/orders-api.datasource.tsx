// src/features/orders/infrastructure/datasources/orders-api.datasource.tsx

import { apiUrl } from '@/shared/config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Order, OrderStatus, OrderType } from '../../domain/entities';

export interface CreateOrderItemPayload {
  productId: number;
  quantity: number;
}

export interface CreateOrderPayload {
  branchId: number;
  type?: OrderType;
  customerName?: string;
  address?: string;
  items: CreateOrderItemPayload[];
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
}

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

// 3. Crear una nueva orden (LOCAL o DOMICILIO)
export const createOrder = async (orderData: CreateOrderPayload): Promise<Order> => {
  try {
    const headers = await getAuthHeaders();
    const payload: CreateOrderPayload = {
      ...orderData,
      type: orderData.type ?? 'LOCAL',
      customerName:
        orderData.type === 'DOMICILIO'
          ? orderData.customerName?.trim()
          : orderData.customerName?.trim() || undefined,
      address:
        orderData.type === 'DOMICILIO'
          ? orderData.address?.trim()
          : undefined,
    };

    const response = await axios.post<Order>(apiUrl('/orders'), payload, headers);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al crear orden');
  }
};

// 4. Actualizar el estado de una orden
export const updateOrderStatus = async (
  id: number,
  statusData: UpdateOrderStatusPayload,
): Promise<Order> => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.patch<Order>(
      apiUrl(`/orders/${id}/status`),
      statusData,
      headers,
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Error al actualizar el estado de la orden',
    );
  }
};