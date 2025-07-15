import { BasketService } from "../../services/basket.service";
import { ModalService } from "../../services/modal.service";
import { OrderService } from "../../services/order.service";
import { Component } from "../../types";
import { cloneTemplate } from "../../utils/utils";

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
export class EmailPhoneOrderComponent implements Component {
  private readonly _template: HTMLTemplateElement;

  constructor(
    private readonly _orderService: OrderService,
    private readonly _modalService: ModalService,
    private readonly _basketService: BasketService
  ) {
    this._template = document.querySelector('#contacts')!;
  }

  render(): HTMLElement {
    // здесь не происходит поиск в корневом дереве. происходит получение старого элемента по ссылке и каждый раз происходит поиск внутри клонированного элемента. не происходит поиск в корневом дереве. нельзя записывать элементы в this, так как это по функционалу класса метод render может вызываться сколько угодно раз и прошлые клонированные элементы в this не будут хранить реальное состояние
    const element = cloneTemplate(this._template);

    const inputEmail = element.querySelector<HTMLInputElement>('input[name="email"]')!;
    const inputPhone = element.querySelector<HTMLInputElement>('input[name="phone"]')!;
    const submitButton = element.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    const formErrors = element.querySelector<HTMLSpanElement>('.form__errors')!;

    const emailErrorEl = document.createElement('span');
    const phoneErrorEl = document.createElement('span');
    formErrors.append(emailErrorEl, phoneErrorEl);

    inputEmail.addEventListener('input', () => {
      this._orderService.updateEmail(inputEmail.value);
    });

    inputPhone.addEventListener('input', () => {
      this._orderService.updatePhone(inputPhone.value);
    });

    const subsFormState = this._orderService.onFormStateChange(['email', 'phone'], (state) => {      
      emailErrorEl.innerHTML = `${state.errors.email ?? ''}<br>`;
      phoneErrorEl.innerHTML = state.errors.phone ?? '';
      submitButton.disabled = !state.isValid;
    });

    element.addEventListener('submit', (event) => {
      event.preventDefault();
      this._orderService.submit();
    });

    this._modalService.onClose(this, () => {
      subsFormState();
      this._orderService.clear();
      this._basketService.clear();
    });

    return element;
  }
}