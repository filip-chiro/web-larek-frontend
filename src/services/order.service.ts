import { EventEmitter } from "../components/base/events";
import { EventNames, Order, Payment } from "../types";
import { ApiOrderService } from "./api-order.service";
import { BasketService } from "./basket.service";
import { StatefulEventEmitterService } from "./stateful-event-emitter.service";
import { ValidationOrderService } from "./validation-order.service";

/**
 * Сервис заказа (OrderService) реализует логику работы с заказом.
 * Взаимодействует со слоями через StatefulEventEmitterService,
 * используя пользовательские события.
 */
export class OrderService {
  constructor(
    private readonly _statefulEventEmitterService: StatefulEventEmitterService,
    private readonly _validationOrderService: ValidationOrderService,
    private readonly _apiOrderService: ApiOrderService,
    private readonly _basketService: BasketService,
    private readonly _eventEmitter: EventEmitter
  ) {}

  get isValid(): boolean {
    const order = { ...this._getCurrentOrder() };
    const result = this._validationOrderService.validate(order, ['email', 'phone', 'address']);
    return result.isValid;
  }

  updateEmail(email: string): void {
    this._emitOrderUpdate({ email });
  }

  updatePhone(phone: string): void {
    this._emitOrderUpdate({ phone });
  }

  setAddress(address: string): void {
    this._emitOrderUpdate({ address });
  }

  setPaymentMethod(payment: Payment): void {
    this._emitOrderUpdate({ payment });
  }

  clear(): void {
    this._statefulEventEmitterService.clearLast(EventNames.ORDER_CHANGED);
  }

  onFormStateChange(
    fields: (keyof Order)[],
    callback: (state: {
      isValid: boolean;
      errors: Partial<Record<keyof Order, string>>;
    }) => void
  ): () => void {
    let hasChanged = false;

    const handler = (order: Partial<Order>) => {
      const hasAnyField = fields.some((field) => order[field] !== undefined && order[field] !== '');
      if (!hasAnyField && !hasChanged) return;

      hasChanged = true;
      const result = this._validationOrderService.validate(order, fields);
      callback(result);
    };

    this._statefulEventEmitterService.on(EventNames.ORDER_CHANGED, handler);

    return () => {
      this._statefulEventEmitterService.off(EventNames.ORDER_CHANGED, handler);
    };
  }

  submit(): void {
    const order = { ...this._getCurrentOrder() };

    order.items = this._basketService.getAll().map((p) => p.id);
    order.total = this._basketService.getPriceBasket();

    if (!this.isValid) {
      alert('Форма содержит ошибки');
      const result = this._validationOrderService.validate(order, ['email', 'phone', 'address']);
      console.warn('Ошибки при сабмите:', result.errors);
      return;
    }

    this._apiOrderService.send(order as Order)
      .then((res) => {
        this._eventEmitter.emit(EventNames.OPEN_SUCCESS_ORDER, res);
      })
      .catch((err) => {
        console.error(err);
        alert('Ошибка при отправке заказа');
      });
  }

  private _emitOrderUpdate(partialOrder: Partial<Order>): void {
    const currentOrder = this._getCurrentOrder();
    const newOrder = { ...currentOrder, ...partialOrder };
    this._statefulEventEmitterService.emitCached(EventNames.ORDER_CHANGED, newOrder);
  }

  private _getCurrentOrder(): Partial<Order> {
    return this._statefulEventEmitterService.getLast<Partial<Order>>(EventNames.ORDER_CHANGED) ?? {};
  }
}
