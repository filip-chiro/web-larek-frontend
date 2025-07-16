import { BasketService } from "../../services/basket.service";
import { ModalService } from "../../services/modal.service";
import { OrderService } from "../../services/order.service";
import { CreateOrderResponse } from "../../types";
import { cloneTemplate, getProductPrice } from "../../utils/utils";
import { CachedComponent } from "./base/cached.component";

interface SuccessOrderData {
  successOrderElement: HTMLElement;
  descriptionElement: HTMLElement;
  successBtnElement: HTMLElement;
}

/**
 * Компонент отображения успешного оформления заказа.
 * 
 * Основные обязанности:
 * - Показывать информацию об успешно оформленном заказе, включая списанную сумму.
 * - Обеспечивать закрытие модального окна по клику на кнопку "Закрыть".
 * - Сброс состояния заказа и корзины при закрытии модального окна.
 */
export class SuccessOrderComponent extends CachedComponent<SuccessOrderData> {
  constructor(
    private readonly _modalService: ModalService
  ) {
    super(document.querySelector('#success'));
  }

  protected _initCachedData(): SuccessOrderData {
    return {
      successOrderElement: this._cachedElement,
      descriptionElement: this._cachedElement.querySelector('.order-success__description'),
      successBtnElement: this._cachedElement.querySelector('.order-success__close')
    }
  }

  protected _afterInit(): void {
    const {
      successOrderElement,
      successBtnElement
    } = this._cachedData;

    successBtnElement.addEventListener('click', () => {
      this._modalService.close(successOrderElement);
    });
  }

  protected _update(res: CreateOrderResponse): void {
    const { descriptionElement } = this._cachedData;

    descriptionElement.textContent = `Списано ${res.total} синапсов`;
  }
}