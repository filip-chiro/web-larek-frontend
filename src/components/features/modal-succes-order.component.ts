import { BasketService } from "../../services/basket.service";
import { OrderService } from "../../services/order.service";
import { StatefulEventEmitterService } from "../../services/stateful-event-emitter.service";
import { cloneTemplate, getProductPrice, getProductPriceText } from "../../utils/utils";
import { ModalComponent } from "./modal.component";

export class ModalSuccessOrderComponent extends ModalComponent {
  private readonly _successOrderTemplate: HTMLTemplateElement;

  constructor(
    private readonly _basketService: BasketService,
    private readonly _orderService: OrderService
  ) {
    super();
    this._successOrderTemplate = document.querySelector('#success');
  }

  open(): void {
    this._renderModalContentSuccessOrder();
    this._open();
  }

  close(): void {
    this._close();
  }

  private _renderModalContentSuccessOrder(): void {
    const successOrderElement = cloneTemplate(this._successOrderTemplate);
    const descriptionElement = successOrderElement.querySelector('.order-success__description');
    const successBtnElement = successOrderElement.querySelector('.order-success__close');
    const priceBasket = this._basketService.getPriceBasket();

    descriptionElement.textContent = `Списано ${getProductPrice(priceBasket)} синапсов`;
    this._closeCallback = () => {
      this._orderService.clear();
      this._basketService.clear();
    };
    successBtnElement.addEventListener('click', () => this.close());

    this._renderModalContent(successOrderElement);
  }
}