import { StatefulEventEmitterService } from "../../../services/stateful-event-emitter.service";
import { EventNames } from "../../../types";
import { EventEmitter } from "../../base/events";

export class BasketHeaderController {
  private readonly _headerBasketElement: HTMLElement;
  private readonly _counterElement: HTMLElement;

  constructor(
    private readonly _eventEmitter: EventEmitter
  ) {
    this._headerBasketElement = document.querySelector('.header__basket');
    this._counterElement = this._headerBasketElement.querySelector('.header__basket-counter');
    this._initEventListeners();
  }

  setQuantityProductsInBasket(quantity: number): void {
    this._counterElement.textContent = String(quantity);
  }

  private _initEventListeners(): void {
    this._headerBasketElement.addEventListener('click', (event) => {
      this._eventEmitter.emit(EventNames.OPEN_BASKET);
    });
  }
}
