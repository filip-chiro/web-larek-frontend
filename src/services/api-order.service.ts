import { CreateOrderRequest, CreateOrderResponse } from "../types";
import { ApiService } from "./api.service";

/**
 * Сервис для работы с заказами через API.
 * Расширяет базовый ApiService, реализует метод отправки заказа.
 */
export class ApiOrderService extends ApiService {
  constructor() {
    super();
  }

  /**
   * Отправить заказ на сервер.
   * Выполняет POST-запрос по эндпоинту '/order' с данными заказа.
   * 
   * @param createOrderRequest Объект с данными для создания заказа.
   * @returns Промис, который разрешается ответом сервера с информацией о созданном заказе.
   */
  send(createOrderRequest: CreateOrderRequest): Promise<CreateOrderResponse> {
    return this.post<CreateOrderResponse>('/order', createOrderRequest);
  }
}