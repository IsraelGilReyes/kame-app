export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: 'COCINA' | 'REPARTIDOR' | 'GERENTE' | 'CAJERO';
  };
}