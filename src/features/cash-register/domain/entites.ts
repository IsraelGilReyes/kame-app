export type CashRegisterStatus = 'OPEN' | 'CLOSED';

export interface CashRegister {
  id: number;
  initialAmount: string | number;
  generatedAmount: string | number;
  totalAmount: string | number;
  status: CashRegisterStatus;
  openedAt: string;
  closedAt?: string | null;
  openedById: number;
  branchId: number;
  openedBy?: {
    id: number;
    name: string;
    email: string;
  };
  branch?: {
    id: number;
    name: string;
    address: string;
  };
  orders?: {
    id: number;
    total: string | number;
    createdAt: string;
  }[];
}