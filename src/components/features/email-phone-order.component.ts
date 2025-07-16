import { BasketService } from "../../services/basket.service";
import { ModalService } from "../../services/modal.service";
import { OrderService } from "../../services/order.service";
import { CachedComponent } from "./base/cached.component";

interface EmailPhoneOrderData {
  inputEmail: HTMLInputElement;
  inputPhone: HTMLInputElement;
  submitButton: HTMLButtonElement;
  formErrors: HTMLSpanElement;
  emailErrorEl: HTMLSpanElement;
  phoneErrorEl: HTMLSpanElement;
}

/**
 * Компонент формы ввода Email и телефона для оформления заказа.
 * 
 * Основные принципы:
 * - Обновление данных в модели происходит непосредственно при событии `input`,
 *   то есть при каждом изменении пользовательского ввода.
 * - Валидация данных выполняется в модели (OrderService) и ValidationOrderService,
 *   представление (этот компонент) **не выполняет валидацию и не хранит данные формы**.
 * - Представление только отображает текущее состояние модели, 
 *   включая ошибки валидации, полученные через подписку на события.
 * - Кнопка отправки формы блокируется/разблокируется в зависимости от валидности данных в модели.
 * - Передача данных между слоем представления и моделью(OrderService) происходит через StatefulEventEmitterService, который в свою очередь наследуется от базового EventEmitter, что обеспечивает реактивность и разделение ответственности.
 * 
 * Это гарантирует, что форма заказа никак не зависит от корзины,
 * и не хранит собственное состояние — все данные централизованно управляются через OrderService
 */
export class EmailPhoneOrderComponent extends CachedComponent<EmailPhoneOrderData> {
  constructor(
    private readonly _orderService: OrderService,
    private readonly _modalService: ModalService,
    private readonly _basketService: BasketService
  ) {
    super(document.querySelector('#contacts'));
  }

  protected _initCachedData(): EmailPhoneOrderData {
    const emailErrorEl = document.createElement('span');
    const phoneErrorEl = document.createElement('span');
    const formErrors = this._cachedElement.querySelector<HTMLSpanElement>('.form__errors')

    formErrors.append(emailErrorEl, phoneErrorEl);

    return {
      inputEmail: this._cachedElement.querySelector<HTMLInputElement>('input[name="email"]'),
      inputPhone: this._cachedElement.querySelector<HTMLInputElement>('input[name="phone"]'),
      submitButton: this._cachedElement.querySelector<HTMLButtonElement>('button[type="submit"]'),
      formErrors: formErrors,
      emailErrorEl: emailErrorEl,
      phoneErrorEl: phoneErrorEl
    };
  }

  protected _afterInit(): void {
    const {
      inputEmail,
      inputPhone,
      submitButton,
      emailErrorEl,
      phoneErrorEl
    } = this._cachedData;

    this._cachedData.inputEmail.addEventListener('input', () => {
      this._orderService.updateEmail(inputEmail.value);
    });

    inputPhone.addEventListener('input', () => {
      this._orderService.updatePhone(inputPhone.value);
    });

    this._orderService.onFormStateChange(['email', 'phone'], (state) => {      
      emailErrorEl.innerHTML = `${state.errors.email ?? ''}<br>`;
      phoneErrorEl.innerHTML = state.errors.phone ?? '';
      submitButton.disabled = !state.isValid;
    });

    this._cachedElement.addEventListener('submit', (event) => {
      event.preventDefault();
      this._orderService.submit();
      if (this._orderService.isValid) {
        this._orderService.clear();
        this._basketService.clear();
      }
    });

    this._modalService.onCloseOnce(this, () => {
      this._orderService.clear();
    });
  }

  private _clearElements(): void {
    this._cachedData.inputEmail.value = '';
    this._cachedData.inputPhone.value = '';
    this._cachedData.submitButton.disabled = true;
    this._cachedData.emailErrorEl.textContent = '';
    this._cachedData.phoneErrorEl.textContent = '';
  }

  protected _update(): void {
    this._clearElements();
  }
  
}