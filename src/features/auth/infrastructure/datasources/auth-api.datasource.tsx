import axios from 'axios';
import { AuthResponse, LoginCredentials } from '../../domain/entities';

// 1. Para web o iOS simulator: usa 'http://localhost:3000'
// 2. Para emulador de Android: usa 'http://10.0.2.2:3000'
// 3. Para dispositivo físico: usa tu IP local (ej. 'http://192.168.1.50:3000')
const API_URL = 'http://localhost:3000'; 

export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    // La petición se realiza a: http://localhost:3000/auth/login
    const response = await axios.post<AuthResponse>(`${API_URL}/auth/login`, credentials);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al conectar con el servidor de NestJS');
  }
};