import { ModalService } from "../../../services/modal.service";
import { OrderService } from "../../../services/order.service";
import { EventNames, Payment } from "../../../types";
import { PaymentAddressOrderData } from "../../../types/components/payment-address-order.component";
import { EventEmitter } from "../../base/events";
import { CachedComponent } from "./base/cached.component";

export class PaymentAddressOrderComponent extends CachedComponent<PaymentAddressOrderData, HTMLFormElement> {
  constructor(
    private readonly _orderService: OrderService,
    private readonly _eventEmitter: EventEmitter,
    private readonly _modalService: ModalService
  ) {
    const template = document.querySelector<HTMLTemplateElement>('#order'); // получение шаблона
    super(template); // получение узлов из дерева только при старте конструктора
  }

  /**
   * Инициализация кэшированных данных, вызывается при старте конструктора (происходит в CachedComponent)
   * Сохраняет результат вызова этой функции в this._cachedData
   */
  protected _initCachedData(): PaymentAddressOrderData {
    return {
      btnOnline: this._clonedTemplate.querySelector<HTMLButtonElement>('[name="card"]'),
      btnOffline: this._clonedTemplate.querySelector<HTMLButtonElement>('[name="cash"]'),
      inputAddress: this._clonedTemplate.querySelector<HTMLInputElement>('[name="address"]'),
      submitBtn: this._clonedTemplate.querySelector<HTMLButtonElement>('.order__button'),
      errors: this._clonedTemplate.querySelector<HTMLSpanElement>('.form__errors'),
      form: this._clonedTemplate
    };
  }

  /**
   * Вызывается один раз после старта конструктора и создания this._cachedData
   */
  protected _afterInit(): void {
    this._setPaymentMethod('online');

    this._cachedData.btnOnline.addEventListener('click', () => {
      this._setPaymentMethod('online');
    });

    this._cachedData.btnOffline.addEventListener('click', () => {
      this._setPaymentMethod('offline');
    });

    this._cachedData.inputAddress.addEventListener('input', () => {
      this._orderService.setAddress(this._cachedData.inputAddress.value);
    });

    this._orderService.onFormStateChange(['address'], (state) => {
      this._cachedData.errors.textContent = state.errors.address ?? '';
      this._cachedData.submitBtn.disabled = !state.isValid;
    });

    this._cachedData.form.addEventListener('submit', (event) => {
      event.preventDefault();
      this._eventEmitter.emit(EventNames.OPEN_ORDER_EMAIL_PHONE);
    });

    // при закрытии модалки ручном (крестик, ESC) сбрасываем состояние заказа
    this._modalService.onCloseOnce(this, () => {
      this._orderService.clear();
    });
  }

  private _setPaymentMethod(currentMethod: Payment): void {
    this._orderService.setPaymentMethod(currentMethod);
    this._updatePaymentButtonStyles(currentMethod);
  }

  private _updatePaymentButtonStyles(
    method: Payment
  ): void {
    this._cachedData.btnOnline.classList.toggle('button_alt-active', method === 'online');
    this._cachedData.btnOffline.classList.toggle('button_alt-active', method === 'offline');
  }

  /**
   * Вызывается каждый раз, когда вызывается публичный метод render
   */
  protected _update(): void {
    this._setPaymentMethod('online');
    this._cachedData.inputAddress.value = '';
    this._cachedData.submitBtn.disabled = true;
    this._cachedData.errors.textContent = '';
  }

}
