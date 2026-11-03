export interface Product {
  id: number;
  name: string;
  price: string | number; // Se recibe como cadena o número desde el Decimal de Prisma
  createdAt?: string;
}