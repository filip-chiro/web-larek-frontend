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
    private readonly _basketService: BasketService
  ) {}

  /**
   * Обновить email в заказе.
   * @param {string} email Email пользователя.
   */
  updateEmail(email: string): void {
    this._emitOrderUpdate({ email });
  }

  /**
   * Обновить телефон в заказе.
   * @param {string} phone Телефон пользователя.
   */
  updatePhone(phone: string): void {
    this._emitOrderUpdate({ phone });
  }

  /**
   * Установить адрес доставки.
   * @param {string} address Адрес.
   */
  setAddress(address: string): void {
    this._emitOrderUpdate({ address });
  }

  /**
   * Установить способ оплаты.
   * @param {Payment} payment Объект оплаты.
   */
  setPaymentMethod(payment: Payment): void {
    this._emitOrderUpdate({ payment });
  }

  /**
   * Очистить текущее состояние заказа.
   */
  clear(): void {
    this._statefulEventEmitterService.clearLast(EventNames.ORDER_CHANGED);
  }

  /**
   * Подписаться на изменение состояния формы.
   * Вызывается при каждом изменении заказа,
   * валидирует указанные поля и возвращает результат.
   * @param {(keyof Order)[]} fields Массив ключей полей для валидации.
   * @param {(state: {isValid: boolean, errors: Partial<Record<keyof Order, string>>}) => void} callback Коллбек с результатом валидации.
   * @returns {() => void} Функция для отписки.
   */
  onFormStateChange(
    fields: (keyof Order)[],
    callback: (state: {
      isValid: boolean;
      errors: Partial<Record<keyof Order, string>>;
    }) => void
  ): () => void {
    let hasChanged = false;

    const handler = (order: Partial<Order>) => {
      // Не вызываем ничего, пока не было первых данных
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

  /**
   * Отправить заказ.
   * Валидирует обязательные поля,
   * если ошибки — выводит alert, иначе отправляет данные через ApiOrderService.
   */
  submit(): void {
    const order = { ...this._getCurrentOrder() };

    order.items = this._basketService.getAll().map(p => p.id);
    order.total = this._basketService.getPriceBasket();

    const validation = this._validationOrderService.validate(order, [
      'email',
      'phone',
      'address'
    ]);

    if (!validation.isValid) {
      alert('Форма содержит ошибки');
      console.warn('Ошибки при сабмите:', validation.errors);
      return;
    }

    this._apiOrderService.send(order as Order)
      .then((res) => {
        this._statefulEventEmitterService.emit(EventNames.OPEN_SUCCESS_ORDER, res);
      })
      .catch(err => {
        console.error(err);
        alert('Ошибка при отправке заказа');
      });
  }

  /**
   * Приватный метод — эмитит обновление заказа,
   * объединяя частичные данные с текущим состоянием.
   * @param {Partial<Order>} partialOrder Частичные данные заказа.
   * @private
   */
  private _emitOrderUpdate(partialOrder: Partial<Order>): void {
    const currentOrder = this._getCurrentOrder();
    const newOrder = { ...currentOrder, ...partialOrder };
    this._statefulEventEmitterService.emit(EventNames.ORDER_CHANGED, newOrder);
  }

  /**
   * Получить текущее состояние заказа из последнего события.
   * @returns {Partial<Order>} Текущий заказ.
   * @private
   */
  private _getCurrentOrder(): Partial<Order> {
    return this._statefulEventEmitterService.getLast<Partial<Order>>(EventNames.ORDER_CHANGED) ?? {};
  }

}
