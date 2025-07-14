import { BasketService } from "../../services/basket.service";
import { ModalService } from "../../services/modal.service";
import { OrderService } from "../../services/order.service";
import { Component } from "../../types";
import { cloneTemplate, getProductPrice } from "../../utils/utils";

/**
 * Компонент отображения успешного оформления заказа.
 * 
 * Основные обязанности:
 * - Показывать информацию об успешно оформленном заказе, включая списанную сумму.
 * - Обеспечивать закрытие модального окна по клику на кнопку "Закрыть".
 * - Сброс состояния заказа и корзины при закрытии модального окна.
 */
export class SuccessOrderComponent implements Component {
  private readonly _successOrderTemplate: HTMLTemplateElement;

  constructor(
    private readonly _basketService: BasketService,
    private readonly _orderService: OrderService,
    private readonly _modalService: ModalService
  ) {
    this._successOrderTemplate = document.querySelector('#success')!;
  }

  /**
   * Рендерит элемент с сообщением об успешном оформлении заказа.
   * 
   * @returns HTMLElement, содержащий сообщение об успехе и кнопку закрытия
   */
  render(): HTMLElement {
    const successOrderElement = cloneTemplate(this._successOrderTemplate);
    const descriptionElement = successOrderElement.querySelector('.order-success__description')!;
    const successBtnElement = successOrderElement.querySelector('.order-success__close')!;
    const priceBasket = this._basketService.getPriceBasket();

    descriptionElement.textContent = `Списано ${getProductPrice(priceBasket)} синапсов`;

    successBtnElement.addEventListener('click', () => {
      this._modalService.close(this);
    });

    this._modalService.onClose(this, this._handleClose);

    return successOrderElement;
  }

  /**
   * Обработчик закрытия модального окна:
   * очищает данные заказа и корзины.
   */
  private _handleClose = () => {
    this._orderService.clear();
    this._basketService.clear();
  };
}