export type OrderStatus = 'PENDIENTE' | 'PREPARACION' | 'ENVIADO' | 'ENTREGADO' | 'CANCELADO';

export interface OrderItem {
  id?: number;
  orderId?: number;
  productId: number;
  quantity: number;
  product?: {
    name: string;
    price: string | number; // 👈 El precio viene del producto vinculado en la BD
  };
}

export interface Order {
  id: number;
  userId: number;
  branchId: number;
  cashRegisterId?: number | null;
  total: string | number;
  status: OrderStatus;
  items: OrderItem[];
  createdAt?: string;
  user?: {
    name: string;
    email: string;
  };
  branch?: {
    name: string;
  };
}