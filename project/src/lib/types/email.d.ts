export type SendResetPasswordEmailParams = {
  email: string;
  otp: string;
  resetUrl: string;
};

export type OrderBillItem = {
  color?: string;
  name: string;
  pack?: string;
  price: number;
  quantity: number;
  scent: string;
  size: string;
};

export type SendOrderBillEmailParams = {
  address: string;
  city: string;
  email: string;
  fullname: string;
  items: OrderBillItem[];
  orderNumber: string;
  paymentMethod: "bank" | "cod";
  phone: string;
  shipping: number;
  subtotal: number;
  total: number;
};

export type SendOrderCancellationEmailParams = {
  email: string;
  fullname: string;
  orderNumber: string;
  reason: string;
};
