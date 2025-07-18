import { BasketService } from "../../../services/basket.service";
import { ModalService } from "../../../services/modal.service";
import { OrderService } from "../../../services/order.service";
import { EmailPhoneOrderData } from "../../../types/components/email-phone-order.component";
import { CachedComponent } from "./base/cached.component";

export class EmailPhoneOrderComponent extends CachedComponent<EmailPhoneOrderData> {
  constructor(
    private readonly _orderService: OrderService,
    private readonly _modalService: ModalService,
    private readonly _basketService: BasketService
  ) {
    const template = document.querySelector<HTMLTemplateElement>('#contacts'); // получение шаблона
    super(template); // получение узлов из дерева только при старте конструктора
  }

  /**
   * Инициализация кэшированных данных, вызывается при старте конструктора (происходит в CachedComponent)
   * Сохраняет результат вызова этой функции в this._cachedData
   */
  protected _initCachedData(): EmailPhoneOrderData {
    const emailErrorEl = document.createElement('span');
    const phoneErrorEl = document.createElement('span');
    const formErrors = this._clonedTemplate.querySelector<HTMLSpanElement>('.form__errors')

    formErrors.append(emailErrorEl, phoneErrorEl);

    return {
      inputEmail: this._clonedTemplate.querySelector<HTMLInputElement>('input[name="email"]'),
      inputPhone: this._clonedTemplate.querySelector<HTMLInputElement>('input[name="phone"]'),
      submitButton: this._clonedTemplate.querySelector<HTMLButtonElement>('button[type="submit"]'),
      formErrors: formErrors,
      emailErrorEl: emailErrorEl,
      phoneErrorEl: phoneErrorEl
    };
  }

  /**
   * Вызывается один раз после старта конструктора и создания this._cachedData
   */
  protected _afterInit(): void {
    this._cachedData.inputEmail.addEventListener('input', () => {
      this._orderService.updateEmail(this._cachedData.inputEmail.value);
    });

    this._cachedData.inputPhone.addEventListener('input', () => {
      this._orderService.updatePhone(this._cachedData.inputPhone.value);
    });

    this._orderService.onFormStateChange(['email', 'phone'], (state) => {      
      this._cachedData.emailErrorEl.innerHTML = `${state.errors.email ?? ''}<br>`;
      this._cachedData.phoneErrorEl.innerHTML = state.errors.phone ?? '';
      this._cachedData.submitButton.disabled = !state.isValid;
    });

    this._clonedTemplate.addEventListener('submit', (event: SubmitEvent) => {
      event.preventDefault();
      
      if (this._orderService.isValid) {
        this._orderService.submit();
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

  /**
   * Вызывается каждый раз, когда вызывается публичный метод render
   */
  protected _update(): void {
    this._clearElements();
  }
  
}