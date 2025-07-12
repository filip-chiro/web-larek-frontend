import { CreateOrderRequest, CreateOrderResponse } from "../types";
import { ApiService } from "./api.service";

export class ApiOrderService extends ApiService {
  constructor() {
    super();
  }

  send(createOrderRequest: CreateOrderRequest): Promise<CreateOrderResponse> {
    return this.post<CreateOrderResponse>('/order', createOrderRequest);
  }
}