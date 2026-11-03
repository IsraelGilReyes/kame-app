import axios from 'axios';
import { AuthResponse, LoginCredentials } from '../../domain/entities';
// 1. Importa la función apiUrl desde tu archivo compartido (ajusta los '..' según la ubicación de tu archivo)
import { apiUrl } from '@/shared/config/api';


export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    // 2. Utiliza apiUrl para construir la ruta completa de forma automática
    const response = await axios.post<AuthResponse>(apiUrl('/auth/login'), credentials);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al conectar con el servidor de NestJS');
  }
};