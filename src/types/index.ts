export type ProductCategory = 'софт-скил' | 'другое' | 'дополнительное' | 'кнопка' | 'хард-скил';

export interface Product {
  id: string;
  description: string;
  image: string;
  title: string;
  category: ProductCategory;
  price: number | null;
}

export type Payment = 'online' | 'offline';

export interface CreateOrderRequest {
  payment: Payment;
  email: string;
  phone: string;
  address: string;
  total: number;
  items: string[];
}

export interface CreateOrderResponse {
  id: string;
  total: number;
}

export interface GetAllProductsResponse {
  total: number;
  items: Product[];
}

export enum EventNames {
  OPEN_CARD_FULL = 'open-card-full',
  BASKET = 'basket',
  OPEN_CART = 'open-cart',
  ORDER = 'order',
  OPEN_ORDER_ADDRESS_PAYMENT = 'open-order-address-payment',
  OPEN_ORDER_EMAIL_PHONE = 'open-order-email-phone',
  OPEN_SUCCESS_ORDER = 'open-success-order',
  EMAIL_INPUT = 'email-input',
  PHONE_INPUT = 'phone-input',
  ORDER_SUBMIT = 'order-submit',
  ORDER_CLEAR = 'order-clear',
  ORDER_CHANGED = 'order-changed',
}

export interface Order {
  payment: Payment;
  email: string;
  phone: string;
  address: string;
  total: number;
  items: string[];
}

export interface Component {
  [x: string]: any;
  render(...args: any[]): HTMLElement;
}