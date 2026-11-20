export type OrderStatus =
  | 'PENDIENTE'
  | 'PREPARACION'
  | 'ENVIADO'
  | 'ENTREGADO'
  | 'CANCELADO';

export type OrderType = 'LOCAL' | 'DOMICILIO';

export interface OrderItem {
  id?: number;
  orderId?: number;
  productId: number;
  quantity: number;
  product?: {
    id?: number;
    name: string;
    price: string | number; // 👈 El precio viene del producto vinculado en la BD
  };
}

export interface Order {
  id: number;
  type?: OrderType;
  userId: number;
  branchId: number;
  cashRegisterId?: number | null;
  customerName?: string | null;
  address?: string | null;
  total: string | number;
  status: OrderStatus;
  items: OrderItem[];
  createdAt?: string;
  user?: {
    id?: number;
    name: string;
    email: string;
  };
  branch?: {
    id?: number;
    name: string;
  };
}