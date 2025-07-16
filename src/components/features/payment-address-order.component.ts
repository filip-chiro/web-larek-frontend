import { ModalService } from "../../services/modal.service";
import { OrderService } from "../../services/order.service";
import { StatefulEventEmitterService } from "../../services/stateful-event-emitter.service";
import { EventNames, Payment } from "../../types";
import { cloneTemplate } from "../../utils/utils";
import { CachedComponent } from "./base/cached.component";

interface PaymentAddressOrderData {
  btnOnline: HTMLButtonElement;
  btnOffline: HTMLButtonElement;
  inputAddress: HTMLInputElement;
  submitBtn: HTMLButtonElement;
  errors: HTMLSpanElement;
  form: HTMLFormElement;
}

/**
 * Компонент формы ввода адреса и выбора способа оплаты для оформления заказа.
 * 
 * Основные принципы:
 * - Обновление данных модели происходит немедленно при событии `input` и переключении оплаты,
 *   то есть при каждом изменении пользовательского ввода или выборе метода оплаты.
 * - Валидация данных производится исключительно в модели (OrderService),
 *   этот компонент **не выполняет валидацию и не хранит состояние формы**.
 * - Представление отражает текущее состояние модели, включая ошибки валидации,
 *   которые поступают через подписку на события.
 * - Кнопка отправки блокируется или активируется в зависимости от валидности данных, 
 *   предоставляемой моделью.
 * - Передача данных между представлением и моделью (OrderService) происходит через 
 *   StatefulEventEmitterService, который наследует функциональность базового EventEmitter,
 *   что обеспечивает реактивность и чёткое разделение ответственности между слоями.
 * 
 * Архитектура гарантирует, что форма заказа не зависит от корзины и не хранит локальное состояние —
 * все данные централизованно управляются через OrderService и распространяются посредством событий.
 */
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

    const unsubscribe = this._orderService.onFormStateChange(['address'], (state) => {
      errors.textContent = state.errors.address ?? '';
      submitBtn.disabled = !state.isValid;
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      this._statefulEventEmitterService.emit(EventNames.OPEN_ORDER_EMAIL_PHONE);
    });

    // при закрытии модалки ручном (крестик, ESC) сбрасываем состояние заказа
    this._modalService.onCloseOnce(this, () => {
      console.log(1);
      
      this._orderService.clear();
      unsubscribe();
    });
  }

  /**
   * Устанавливает выбранный способ оплаты в модель (OrderService)
   * и обновляет отображение активной кнопки.
   *
   * @param currentMethod - Новый способ оплаты ('online' или 'offline').
   * @param btnOnline - Кнопка "Онлайн".
   * @param btnOffline - Кнопка "При получении".
   */
  private _setPaymentMethod(
    currentMethod: Payment,
    btnOnline: HTMLButtonElement,
    btnOffline: HTMLButtonElement
  ): void {
    this._orderService.setPaymentMethod(currentMethod);
    this._updatePaymentButtonStyles(currentMethod, btnOnline, btnOffline);
  }

  /**
   * Обновляет CSS-классы активного состояния для кнопок способов оплаты.
   *
   * @param method - Выбранный способ оплаты.
   * @param btnOnline - Кнопка "Онлайн".
   * @param btnOffline - Кнопка "При получении".
   */
  private _updatePaymentButtonStyles(
    method: Payment,
    btnOnline: HTMLButtonElement,
    btnOffline: HTMLButtonElement
  ): void {
    btnOnline.classList.toggle('button_alt-active', method === 'online');
    btnOffline.classList.toggle('button_alt-active', method === 'offline');
  }

}