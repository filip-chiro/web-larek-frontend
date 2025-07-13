import { OrderService } from "../../services/order.service";
import { Payment } from "../../types";
import { cloneTemplate } from "../../utils/utils";
import { ModalComponent } from "./modal.component";

export class ModalPaymentAddressOrderComponent extends ModalComponent {
  private readonly _paymentAddressOrderTemplate: HTMLTemplateElement;

  constructor(
    private readonly _orderService: OrderService
  ) {
    super(); 
    this._paymentAddressOrderTemplate = document.querySelector('#order');
  }

  private _renderModalContentPaymentAddressOrder(): void {
    const parentElement =  cloneTemplate(this._paymentAddressOrderTemplate);
    const btnOnlineElement = parentElement.querySelector<HTMLButtonElement>('[name="card"]');
    const btnOffileElement = parentElement.querySelector<HTMLButtonElement>('[name="cash"]');
    const inputAddressElement = parentElement.querySelector<HTMLInputElement>('[name="address"]');
    const btnSubmitElement = parentElement.querySelector<HTMLButtonElement>('.order__button');
    const formErrorsElement = parentElement.querySelector<HTMLSpanElement>('.form__errors');

    this._setPaymentMethod('online', btnOnlineElement, btnOffileElement);

    btnOnlineElement.addEventListener('click', () => {
      this._setPaymentMethod('online', btnOnlineElement, btnOffileElement);
    });

    btnOffileElement.addEventListener('click', () => {
      this._setPaymentMethod('offline', btnOnlineElement, btnOffileElement);
    });

    inputAddressElement.autocomplete = 'on';

    // inputAddressElement.addEventListener('input', () => {
    //   this._renderAddressErrors(formErrorsElement, inputAddressElement);
    // });

    this._renderModalContent(parentElement);
  }

  private _setPaymentMethod(
    paymentMethod: Payment,
    btnOnlineElement: HTMLButtonElement,
    btnOffileElement: HTMLButtonElement
  ): void {
    if (paymentMethod === 'online') {
      btnOnlineElement.classList.add('button_alt-active');
      btnOffileElement.classList.remove('button_alt-active');
      this._orderService.setPaymentMethod(paymentMethod);
    } else if (paymentMethod === 'offline') {
      btnOnlineElement.classList.remove('button_alt-active');
      btnOffileElement.classList.add('button_alt-active');
      this._orderService.setPaymentMethod(paymentMethod);
    }
  }

  private _renderAddressErrors(
    formErrorsElement: HTMLSpanElement,
    inputAddressElement: HTMLInputElement
  ): void {
    if (inputAddressElement.value.length !== 0) {
      formErrorsElement.textContent = 'Необходимо указать адрес';
    } else {
      formErrorsElement.textContent = '';
    }
  }

  open(): void {
    this._renderModalContentPaymentAddressOrder();
    this._open();
  }

  close(): void {
    this._close();
  }
}