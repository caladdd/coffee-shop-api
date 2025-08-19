export interface Order {
  orderId: string;
  customerName: string;
  coffeeType: string;
  status: 'PENDING'  | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
}