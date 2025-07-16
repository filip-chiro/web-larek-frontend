import { ModalService } from "../../../services/modal.service";
import { OrderService } from "../../../services/order.service";
import { StatefulEventEmitterService } from "../../../services/stateful-event-emitter.service";
import { EventNames, Payment } from "../../../types";
import { PaymentAddressOrderData } from "../../../types/components/payment-address-order.component";
import { CachedComponent } from "./base/cached.component";

export class PaymentAddressOrderComponent extends CachedComponent<PaymentAddressOrderData, HTMLFormElement> {
  constructor(
    private readonly _orderService: OrderService,
    private readonly _statefulEventEmitterService: StatefulEventEmitterService,
    private readonly _modalService: ModalService
  ) {
    super(document.querySelector('#order'));
  }

  protected _initCachedData(): PaymentAddressOrderData {
    return {
      btnOnline: this._cachedElement.querySelector<HTMLButtonElement>('[name="card"]'),
      btnOffline: this._cachedElement.querySelector<HTMLButtonElement>('[name="cash"]'),
      inputAddress: this._cachedElement.querySelector<HTMLInputElement>('[name="address"]'),
      submitBtn: this._cachedElement.querySelector<HTMLButtonElement>('.order__button'),
      errors: this._cachedElement.querySelector<HTMLSpanElement>('.form__errors'),
      form: this._cachedElement
    };
  }

  protected _afterInit(): void {
    const {
      btnOnline,
      btnOffline,
      inputAddress,
      submitBtn,
      errors,
      form
    } = this._cachedData;

    this._setPaymentMethod('online', btnOnline, btnOffline);

    btnOnline.addEventListener('click', () => {
      this._setPaymentMethod('online', btnOnline, btnOffline);
    });

    btnOffline.addEventListener('click', () => {
      this._setPaymentMethod('offline', btnOnline, btnOffline);
    });

    inputAddress.addEventListener('input', () => {
      this._orderService.setAddress(inputAddress.value);
    });

    this._orderService.onFormStateChange(['address'], (state) => {
      errors.textContent = state.errors.address ?? '';
      submitBtn.disabled = !state.isValid;
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      this._statefulEventEmitterService.emit(EventNames.OPEN_ORDER_EMAIL_PHONE);
    });

    // при закрытии модалки ручном (крестик, ESC) сбрасываем состояние заказа
    this._modalService.onCloseOnce(this, () => {
      this._orderService.clear();
    });
  }

  private _setPaymentMethod(
    currentMethod: Payment,
    btnOnline: HTMLButtonElement,
    btnOffline: HTMLButtonElement
  ): void {
    this._orderService.setPaymentMethod(currentMethod);
    this._updatePaymentButtonStyles(currentMethod, btnOnline, btnOffline);
  }

  private _updatePaymentButtonStyles(
    method: Payment,
    btnOnline: HTMLButtonElement,
    btnOffline: HTMLButtonElement
  ): void {
    btnOnline.classList.toggle('button_alt-active', method === 'online');
    btnOffline.classList.toggle('button_alt-active', method === 'offline');
  }

  protected _update(): void {
    const {
      btnOnline,
      btnOffline,
      submitBtn,
      inputAddress,
      errors
    } = this._cachedData;
    
    this._setPaymentMethod('online', btnOnline, btnOffline);

    inputAddress.value = '';
    submitBtn.disabled = true;
    errors.textContent = '';
  }

}
