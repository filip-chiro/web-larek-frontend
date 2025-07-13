import { EventNames, Order, Payment, Product } from "../types";
import { ApiOrderService } from "./api-order.service";
import { StatefulEventEmitterService } from "./stateful-event-emitter.service";

export class OrderService {
  constructor(
    private readonly _statefulEventEmitterService: StatefulEventEmitterService,
    private readonly _apiOrderService: ApiOrderService
  ) {}

  getOrder(): Partial<Order> {
    const order = this._statefulEventEmitterService.getLast<Partial<Order>>(EventNames.ORDER);
    return {
      items: [],
      ...order,
    };
  }

  getValidOrder(): Order {
    const order = this.getOrder();

    if (!this.isValid()) {
      throw new Error('Order is not valid');
    }

    return order as Order;
  }

  sendOrder(): void {
    if (!this.isValid()) {
      return;
    }
    this._apiOrderService.send(this.getValidOrder());
  }

  isValid(): boolean {
    const order = this.getOrder();

    return order.email && order.address && order.phone && order.payment && order.items.length !== 0;
  }

  setPaymentMethod(paymentMethod: Payment): void {
    const order = this.getOrder();
    this._statefulEventEmitterService.emit(EventNames.ORDER, {
      ...order,
      payment: paymentMethod
    });
  }

  setAddress(address: string): void {
    const order = this.getOrder();
    this._statefulEventEmitterService.emit(EventNames.ORDER, {
      ...order,
      address
    });
  }

  setEmail(email: string): void {
    const order = this.getOrder();
    this._statefulEventEmitterService.emit(EventNames.ORDER, {
      ...order,
      email
    });
  }

  setPhone(phone: string): void {
    const order = this.getOrder();
    this._statefulEventEmitterService.emit(EventNames.ORDER, {
      ...order,
      phone
    });
  }

  setProducts(products: Product[]): void {
    const order = this.getOrder();
    this._statefulEventEmitterService.emit(EventNames.ORDER, {
      ...order,
      items: products.map(product => product.id)
    });
  }

}