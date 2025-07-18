import { BasketService } from "../../../services/basket.service"
import { EventNames, Product } from "../../../types";
import { BasketComponentData } from "../../../types/components/basket.component";
import { EventEmitter } from "../../base/events";
import { CachedComponent } from "./base/cached.component";
import { BasketCardComponent } from "./basket-card.component";

export class BasketComponent extends CachedComponent<BasketComponentData> {
  constructor(
    private readonly _basketService: BasketService,
    private readonly _basketCardComponent: BasketCardComponent,
    private readonly _eventEmitter: EventEmitter
  ) {
    const template = document.querySelector<HTMLTemplateElement>('#basket'); // получение шаблона
    super(template); // получение узлов из дерева только при старте конструктора
  }

  /**
   * Инициализация кэшированных данных, вызывается при старте конструктора (происходит в CachedComponent)
   * Сохраняет результат вызова этой функции в this._cachedData
   */
  protected _initCachedData(): BasketComponentData {
    return {
      basketElement: this._clonedTemplate,
      basketList: this._clonedTemplate.querySelector<HTMLUListElement>('.basket__list'),
      priceElement: this._clonedTemplate.querySelector<HTMLSpanElement>('.basket__price'),
      submitBtnElement: this._clonedTemplate.querySelector<HTMLButtonElement>('.basket__button')
    };
  }
  
  /**
   * Вызывается один раз после старта конструктора и создания this._cachedData
   */
  protected _afterInit(): void {
    this._basketService.onBasket((products: Product[]) => this._renderAll(products));

    this._cachedData.submitBtnElement.addEventListener('click', () => {
      this._eventEmitter.emit(EventNames.OPEN_ORDER_ADDRESS_PAYMENT);
    });
  }

  private _appendBasketElements(products: Product[]): void {
    if (products.length !== 0) {
      this._cachedData.basketList.classList.remove('basket__list_empty');
      this._cachedData.basketList.textContent = ''
    }
    
    for (let i = 0; i < products.length; i++) {
      const basketCardElement = this._basketCardComponent.render(products[i], i);
      this._cachedData.basketList.appendChild(basketCardElement);
    }
  }

  private _renderActionsInfo(priceBasket: number): void {
    this._cachedData.submitBtnElement.disabled = priceBasket === 0;
    this._cachedData.priceElement.textContent = `${priceBasket} синапсов`;
    if (priceBasket === 0) {
      this._cachedData.basketList.classList.add('basket__list_empty');
      this._cachedData.basketList.textContent = 'Корзина пуста'
    };
  }

  private _renderAll(products: Product[]): void {
    this._renderActionsInfo(this._basketService.getPriceBasket());
    this._appendBasketElements(products);
  }
}
