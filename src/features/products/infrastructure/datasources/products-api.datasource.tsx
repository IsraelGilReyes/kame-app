import { apiUrl } from '@/shared/config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Product } from '../../domain/entities';


const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('@kame_token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getProducts = async (): Promise<Product[]> => {
  const headers = await getAuthHeaders();
  const response = await axios.get<Product[]>(apiUrl('/products'), headers);
  return response.data;
};

export const createProduct = async (productData: { name: string; price: number }): Promise<Product> => {
  const headers = await getAuthHeaders();
  const response = await axios.post<Product>(apiUrl('/products'), productData, headers);
  return response.data;
};

// Usamos .put() para que coincida con @Put(':id') de tu NestJS
export const updateProduct = async (id: number, productData: { name: string; price: number }): Promise<Product> => {
  const headers = await getAuthHeaders();
  const response = await axios.put<Product>(apiUrl(`/products/${id}`), productData, headers);
  return response.data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  const headers = await getAuthHeaders();
  try {
    console.log(`🗑️ Enviando petición DELETE para el producto ID: ${id}`);
    const response = await axios.delete(apiUrl(`/products/${id}`), headers);
    console.log('✅ Producto eliminado con éxito en el backend:', response.data);
  } catch (error: any) {
    console.error('❌ Error detallado al eliminar en el backend:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'No se pudo eliminar el producto');
  }
};