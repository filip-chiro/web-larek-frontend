import { BasketService } from "../../services/basket.service";
import { StatefulEventEmitterService } from "../../services/stateful-event-emitter.service";
import { EventNames, Product } from "../../types";
import { cloneTemplate } from "../../utils/utils";
import { BasketCardComponent } from "./basket-card.component";
import { ModalComponent } from "./modal.component";

export class ModalBasketComponent extends ModalComponent {
  private readonly _basketTemplate: HTMLTemplateElement;

  constructor(
    private readonly _basketService: BasketService,
    private readonly _basketCardComponent: BasketCardComponent,
    private readonly _statefulEventEmitterService: StatefulEventEmitterService
  ) {
    super();
    this._basketTemplate = document.querySelector('#basket');
  }

  open(): void {
    this._renderModalContentBasket();
    this._open();
  }

  close(): void {
    this._close();
  }

  private _renderModalContentBasket(): void {
    const basketElement = cloneTemplate(this._basketTemplate);
    const listElement = basketElement.querySelector<HTMLUListElement>('.basket__list');
    const priceElement = basketElement.querySelector<HTMLSpanElement>('.basket__price');
    const submitBtnElement = basketElement.querySelector<HTMLButtonElement>('.basket__button');
    const getPriceBasket = () => this._basketService.getPriceBasket();
    const products = this._basketService.getAll();

    listElement.textContent = '';

    submitBtnElement.addEventListener('click', () => {
      this._statefulEventEmitterService.emit(EventNames.OPEN_ORDER_ADDRESS_PAYMENT);
    });
    
    this._renderActionsInfo(submitBtnElement, priceElement, listElement, getPriceBasket());
    this._appendBasketElements(listElement, products);

    const onBasketCallback = (products: Product[]) => {
      listElement.textContent = '';
      this._renderActionsInfo(submitBtnElement, priceElement, listElement, getPriceBasket());
      this._appendBasketElements(listElement, products);
    };

    this._closeCallback = () => {
      this._basketService.offBasket(onBasketCallback);
    };

    this._basketService.onBasket(onBasketCallback);

    this._renderModalContent(basketElement);
  }

  private _appendBasketElements(listElement: HTMLUListElement, products: Product[]): void {
    for (let i = 0; i < products.length; i++) {
      const basketCardElement = this._basketCardComponent.createElement(products[i], i);
      listElement.appendChild(basketCardElement);
    };
  }

  private _renderActionsInfo(
    submitBtnElement: HTMLButtonElement,
    priceElement: HTMLSpanElement,
    listElement: HTMLUListElement,
    priceBasket: number
  ): void {
  if (priceBasket === 0) submitBtnElement.disabled = true;
    priceElement.textContent = `${priceBasket} синапсов`;
    if (priceBasket === 0) {
      const listItemEmptyElement = document.createElement('div');
      listItemEmptyElement.classList.add('basket__list-empty');
      listItemEmptyElement.textContent = 'Корзина пуста';
      listElement.appendChild(listItemEmptyElement);
    };
  }
  
}