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
  OPEN_CARD_FULL = 'open-card-full', // открытие модального окна с полной карточкой товара
  BASKET_CHANGED = 'basket-changed', // обновление списка товаров в корзине
  OPEN_BASKET = 'open-basket', // открытие корзины
  OPEN_ORDER_ADDRESS_PAYMENT = 'open-order-address-payment', // открытие модального окна с адресом и способом оплаты
  OPEN_ORDER_EMAIL_PHONE = 'open-order-email-phone', // открытие модального окна с email и телефоном
  OPEN_SUCCESS_ORDER = 'open-success-order', // открытие модального окна с информацией о заказе
  ORDER_CHANGED = 'order-changed', //  изменение состояния заказа
  PRODUCTS_CHANGED = 'products-changed' // изменение состояния списка продуктов, которые рендерятся в галерее
}

export interface Order {
  payment: Payment;
  email: string;
  phone: string;
  address: string;
  total: number;
  items: string[];
}

export interface DIInitializable {
  /** Только для DIContainer */
  __di_init?(): void;
}
