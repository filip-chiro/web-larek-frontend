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