import { BasketService } from "../../services/basket.service";
import { ModalService } from "../../services/modal.service";
import { OrderService } from "../../services/order.service";
import { Component, CreateOrderResponse } from "../../types";
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
    private readonly _modalService: ModalService
  ) {
    this._successOrderTemplate = document.querySelector('#success')!;
  }

  /**
   * Рендерит элемент с сообщением об успешном оформлении заказа.
   * 
   * @returns HTMLElement, содержащий сообщение об успехе и кнопку закрытия
   */
  render(res: CreateOrderResponse): HTMLElement {
    // здесь не происходит поиск в корневом дереве. происходит получение старого элемента по ссылке и каждый раз происходит поиск внутри клонированного элемента. не происходит поиск в корневом дереве. нельзя записывать элементы в this, так как это по функционалу класса метод render может вызываться сколько угодно раз и прошлые клонированные элементы в this не будут хранить реальное состояние
    const successOrderElement = cloneTemplate(this._successOrderTemplate);
    const descriptionElement = successOrderElement.querySelector('.order-success__description');
    const successBtnElement = successOrderElement.querySelector('.order-success__close');

    descriptionElement.textContent = `Списано ${res.total} синапсов`;

    successBtnElement.addEventListener('click', () => {
      this._modalService.close(successOrderElement);
    });

    return successOrderElement;
  }
}