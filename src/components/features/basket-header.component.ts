import { StatefulEventEmitterService } from "../../services/stateful-event-emitter.service";
import { EventNames } from "../../types";

/**
 * Компонент для отображения состояния корзины в шапке сайта.
 * 
 * Отвечает за отображение количества товаров в корзине и
 * обработку клика по иконке корзины для открытия корзины.
 */
export class BasketHeaderComponent {
  private readonly _headerBasketElement: HTMLElement;
  private readonly _counterElement: HTMLElement;

  constructor(
    private readonly _statefulEventEmitterService: StatefulEventEmitterService
  ) {
    this._headerBasketElement = document.querySelector('.header__basket');
    this._counterElement = this._headerBasketElement.querySelector('.header__basket-counter');
    this._initEventListeners();
  }

  /**
   * Обновляет отображаемое количество товаров в корзине.
   * 
   * @param quantity - количество товаров для отображения
   */
  setQuantityProductsInBasket(quantity: number): void {
    this._counterElement.textContent = String(quantity);
  }

  /**
   * Инициализирует обработчики событий компонента,
   * в частности навешивает обработчик клика на иконку корзины,
   * который инициирует событие открытия корзины через EventEmitter.
   */
  private _initEventListeners(): void {
    this._headerBasketElement.addEventListener('click', (event) => {
      this._statefulEventEmitterService.emit(EventNames.OPEN_CART);
    });
  }
}