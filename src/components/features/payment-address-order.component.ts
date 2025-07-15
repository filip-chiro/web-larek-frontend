import { ModalService } from "../../services/modal.service";
import { OrderService } from "../../services/order.service";
import { StatefulEventEmitterService } from "../../services/stateful-event-emitter.service";
import { Component, EventNames, Payment } from "../../types";
import { cloneTemplate } from "../../utils/utils";

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
export class PaymentAddressOrderComponent implements Component {
  private readonly _template: HTMLTemplateElement;

  constructor(
    private readonly _orderService: OrderService,
    private readonly _statefulEventEmitterService: StatefulEventEmitterService,
    private readonly _modalService: ModalService
  ) {
    this._template = document.querySelector('#order')!;
  }

  /**
   * Рендерит форму с полем ввода адреса и кнопками выбора способа оплаты (наличные или карта).
   * Также настраивает реактивное отображение ошибок валидации и отключение кнопки сабмита.
   *
   * @returns {HTMLElement} HTML-элемент формы для вставки в DOM.
   */
  render(): HTMLElement {
    // здесь не происходит поиск в корневом дереве. происходит получение старого элемента по ссылке и каждый раз происходит поиск внутри клонированного элемента. не происходит поиск в корневом дереве. нельзя записывать элементы в this, так как это по функционалу класса метод render может вызываться сколько угодно раз и прошлые клонированные элементы в this не будут хранить реальное состояние
    const element = cloneTemplate(this._template);
    const btnOnline = element.querySelector<HTMLButtonElement>('[name="card"]')!;
    const btnOffline = element.querySelector<HTMLButtonElement>('[name="cash"]')!;
    const inputAddress = element.querySelector<HTMLInputElement>('[name="address"]')!;
    const submitBtn = element.querySelector<HTMLButtonElement>('.order__button')!;
    const errors = element.querySelector<HTMLSpanElement>('.form__errors')!;
    const form = element;

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
      this._orderService.clear();
      unsubscribe();
    });

    return element;
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
}