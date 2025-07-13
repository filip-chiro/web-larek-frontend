import { OrderService } from "../../services/order.service";
import { StatefulEventEmitterService } from "../../services/stateful-event-emitter.service";
import { EventNames, Payment } from "../../types";
import { cloneTemplate } from "../../utils/utils";
import { ModalComponent } from "./modal.component";

export class ModalPaymentAddressOrderComponent extends ModalComponent {
  private readonly _paymentAddressOrderTemplate: HTMLTemplateElement;

  constructor(
    private readonly _orderService: OrderService,
    private readonly _statefulEventEmitterService: StatefulEventEmitterService
  ) {
    super(); 
    this._paymentAddressOrderTemplate = document.querySelector('#order');
  }

  open(): void {
    this._renderModalContentPaymentAddressOrder();
    this._open();
  }

  close(): void {
    this._close();
  }

  private _renderModalContentPaymentAddressOrder(): void {
    const parentElement = cloneTemplate(this._paymentAddressOrderTemplate);
    const btnOnlineElement = parentElement.querySelector<HTMLButtonElement>('[name="card"]');
    const btnOffileElement = parentElement.querySelector<HTMLButtonElement>('[name="cash"]');
    const inputAddressElement = parentElement.querySelector<HTMLInputElement>('[name="address"]');
    const btnSubmitElement = parentElement.querySelector<HTMLButtonElement>('.order__button');
    const formErrorsElement = parentElement.querySelector<HTMLSpanElement>('.form__errors');
    const formElement = parentElement;
    
    let currentMethod: Payment = 'online';

    this._setPaymentMethod('online', btnOnlineElement, btnOffileElement);

    btnOnlineElement.addEventListener('click', () => {
      currentMethod = 'online';
      this._setPaymentMethod('online', btnOnlineElement, btnOffileElement);
    });

    btnOffileElement.addEventListener('click', () => {
      currentMethod = 'offline';
      this._setPaymentMethod('offline', btnOnlineElement, btnOffileElement);
    });

    inputAddressElement.addEventListener('input', () => {
      this._validateForm(formErrorsElement, inputAddressElement, btnSubmitElement);
    });

    this._closeCallback = () => {
      this._orderService.clear();
    };

    formElement.addEventListener('submit', (event) => {
      event.preventDefault();
      this._orderService.setPaymentMethod(currentMethod);
      this._orderService.setAddress(inputAddressElement.value);
      this._statefulEventEmitterService.emit(EventNames.OPEN_ORDER_EMAIL_PHONE);
    });

    this._renderModalContent(parentElement);
  }

  private _validateForm(
    formErrorsElement: HTMLSpanElement,
    inputAddressElement: HTMLInputElement,
    btnSubmitElement: HTMLButtonElement
  ): void {
    this._renderAddressErrors(formErrorsElement, inputAddressElement);

    btnSubmitElement.disabled = inputAddressElement.value.length === 0;
  }

  private _setPaymentMethod(
    paymentMethod: Payment,
    btnOnlineElement: HTMLButtonElement,
    btnOffileElement: HTMLButtonElement
  ): void {
    if (paymentMethod === 'online') {
      btnOnlineElement.classList.add('button_alt-active');
      btnOffileElement.classList.remove('button_alt-active');
    } else if (paymentMethod === 'offline') {
      btnOnlineElement.classList.remove('button_alt-active');
      btnOffileElement.classList.add('button_alt-active');
    }
  }

  private _renderAddressErrors(
    formErrorsElement: HTMLSpanElement,
    inputAddressElement: HTMLInputElement
  ): void {
    if (inputAddressElement.value.length === 0) {
      formErrorsElement.textContent = 'Необходимо указать адрес';
    } else {
      formErrorsElement.textContent = '';
    }
  }
}