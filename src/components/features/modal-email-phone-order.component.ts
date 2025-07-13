import { BasketService } from "../../services/basket.service";
import { OrderService } from "../../services/order.service";
import { StatefulEventEmitterService } from "../../services/stateful-event-emitter.service";
import { EventNames } from "../../types";
import { cloneTemplate } from "../../utils/utils";
import { ModalComponent } from "./modal.component";

export class ModalEmailPhoneOrderComponent extends ModalComponent {
  private readonly _contactsTemplate: HTMLTemplateElement;

  constructor(
    private readonly _orderService: OrderService,
    private readonly _statefulEventEmitterService: StatefulEventEmitterService,
    private readonly _basketService: BasketService
  ) {
    super();
    this._contactsTemplate = document.querySelector('#contacts');
  }

  open(): void {
    this._renderModalContentEmailPhoneOrder();
    this._open();
  }

  close(): void {
    this._close();
  }

  private _renderModalContentEmailPhoneOrder(): void {
    const contactsElement = cloneTemplate(this._contactsTemplate);
    const inputEmailElement = contactsElement.querySelector<HTMLInputElement>('input[name="email"]');
    const inputPhoneElement = contactsElement.querySelector<HTMLInputElement>('input[name="phone"]');
    const btnSubmitElement = contactsElement.querySelector<HTMLButtonElement>('button[type="submit"]');
    const formErrorsElement = contactsElement.querySelector<HTMLSpanElement>('.form__errors');
    const formEmailErrorsElement = document.createElement('span');
    const formPhoneErrorsElement = document.createElement('span');
    const formElement = contactsElement;

    formErrorsElement.append(
      formEmailErrorsElement,
      formPhoneErrorsElement
    );

    inputEmailElement.addEventListener('input', () => {
      this._renderEmailErrors(inputEmailElement, formEmailErrorsElement);
      this._validateForm(inputEmailElement, inputPhoneElement, btnSubmitElement);
    });

    inputPhoneElement.addEventListener('input', () => {
      this._renderPhoneErrors(inputPhoneElement, formPhoneErrorsElement);
      this._validateForm(inputEmailElement, inputPhoneElement, btnSubmitElement);
    });

    this._closeCallback = () => {
      this._orderService.clear();
    };

    formElement.addEventListener('submit', (event) => {
      event.preventDefault();
      this._orderService.setEmail(inputEmailElement.value);
      this._orderService.setPhone(inputPhoneElement.value);
      this._orderService.setProducts(this._basketService.getAll(), this._basketService.getPriceBasket());

      if (!this._orderService.isValid()) {
        console.log('Order is not valid');
        return;
      }
      
      this._orderService.sendOrder()
        .catch(() => {
          alert('При оправке заказа произошла ошибка');
        })
        .then(() => {
          this._statefulEventEmitterService.emit(EventNames.OPEN_SUCCESS_ORDER);
        })
    });

    this._renderModalContent(contactsElement);
  }

  private _renderEmailErrors(
    inputEmailElement: HTMLInputElement,
    formEmailErrorsElement: HTMLSpanElement
  ): void {
    formEmailErrorsElement.innerHTML = inputEmailElement.value.length === 0 ? 'Необходимо указать email<br>' : '';
  }

  private _renderPhoneErrors(
    inputPhoneElement: HTMLInputElement,
    formPhoneErrorsElement: HTMLSpanElement
  ): void {
    formPhoneErrorsElement.innerHTML = inputPhoneElement.value.length === 0 ? 'Необходимо указать телефон' : '';
  }

  private _validateForm(
    inputEmailElement: HTMLInputElement,
    inputPhoneElement: HTMLInputElement,
    btnSubmitElement: HTMLButtonElement
  ): void {
    btnSubmitElement.disabled = inputEmailElement.value.length === 0 || inputPhoneElement.value.length === 0;
  }
}