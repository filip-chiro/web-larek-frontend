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

    this._cachedElement.addEventListener('submit', (event: SubmitEvent) => {
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