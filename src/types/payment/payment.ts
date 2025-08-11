
export interface PaymentResponse {
  qrCode: string;
  paymentId: string;
  totalAmount: number;
  orderCount: number;
  orderIds: string[];
  description: string;
}