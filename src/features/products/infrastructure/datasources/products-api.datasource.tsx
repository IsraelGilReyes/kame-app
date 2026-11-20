import { apiUrl } from '@/shared/config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Product } from '../../domain/entities';

export interface ProductPayload {
  name: string;
  price: number;
}

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('@kame_token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getProducts = async (): Promise<Product[]> => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get<Product[]>(apiUrl('/products'), headers);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al obtener productos');
  }
};

export const createProduct = async (productData: ProductPayload): Promise<Product> => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post<Product>(
      apiUrl('/products'),
      { ...productData, name: productData.name.trim() },
      headers,
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al crear producto');
  }
};

// Usamos .put() para que coincida con @Put(':id') de tu NestJS
export const updateProduct = async (
  id: number,
  productData: ProductPayload,
): Promise<Product> => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.put<Product>(
      apiUrl(`/products/${id}`),
      { ...productData, name: productData.name.trim() },
      headers,
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al actualizar producto');
  }
};

export const deleteProduct = async (id: number): Promise<void> => {
  const headers = await getAuthHeaders();
  try {
    console.log(`🗑️ Enviando petición DELETE para el producto ID: ${id}`);
    const response = await axios.delete(apiUrl(`/products/${id}`), headers);
    console.log('✅ Producto eliminado con éxito en el backend:', response.data);
  } catch (error: any) {
    console.error(
      '❌ Error detallado al eliminar en el backend:',
      error.response?.data || error.message,
    );
    throw new Error(error.response?.data?.message || 'No se pudo eliminar el producto');
  }
};