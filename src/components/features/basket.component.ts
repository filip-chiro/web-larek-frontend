import { BasketService } from "../../services/basket.service";
import { ModalService } from "../../services/modal.service";
import { StatefulEventEmitterService } from "../../services/stateful-event-emitter.service";
import { EventNames, Product } from "../../types";
import { CachedComponent } from "./base/cached.component";
import { BasketCardComponent } from "./basket-card.component";

interface BasketComponentData {
  basketElement: HTMLElement;
  basketList: HTMLUListElement;
  priceElement: HTMLElement;
  submitBtnElement: HTMLButtonElement;
  listItemEmptyElement: HTMLElement;
}

/**
 * Компонент представления корзины, реализующий слой **View** в архитектуре MVVM (или MVP).
 *
 * Отвечает исключительно за отображение содержимого корзины и взаимодействие с DOM-элементами,
 * не содержит бизнес-логики, не хранит состояния и не взаимодействует напрямую ни с моделью,
 * ни с контроллером. Получает данные и инструкции исключительно через события.
 * 
 *  Архитектурные особенности:
 *
 * - Использует `StatefulEventEmitterService` (реализация паттерна **EventEmitter**) для подписки на события и инициации пользовательских событий.
 * - Не создает экземпляры модели или контроллера, не зависит от них напрямую.
 * - Не валидирует данные, не изменяет модель, а только реагирует на изменения и инициирует переходы состояний.
 * - Подписывается на события изменения состояния корзины (`EventNames.BASKET`) и перерисовывает DOM при каждом обновлении.
 * - Вызывает событие `EventNames.OPEN_ORDER_ADDRESS_PAYMENT` при нажатии на кнопку оформления заказа, не передавая никаких данных напрямую.
 * - Отписывается от событий при закрытии модального окна (через this._modalService.onClose), избегая утечек памяти.
 *
 */
export class BasketComponent extends CachedComponent<BasketComponentData> {
  constructor(
    private readonly _basketService: BasketService,
    private readonly _basketCardComponent: BasketCardComponent,
    private readonly _statefulEventEmitterService: StatefulEventEmitterService,
    private readonly _modalService: ModalService
  ) {
    super(document.querySelector('#basket'));
  }

  protected _initCachedData(): BasketComponentData {
    const listItemEmptyElement = document.createElement('div');
    const basketList = this._cachedElement.querySelector<HTMLUListElement>('.basket__list');
    const basketListContent = document.createElement('div');

    listItemEmptyElement.classList.add('basket__list-empty');
    basketListContent.classList.add('basket__list-content');
    basketList.parentElement.insertBefore(basketListContent, basketList);
    basketListContent.appendChild(listItemEmptyElement);
    basketListContent.appendChild(basketList);

    return {
      basketElement: this._cachedElement,
      basketList: basketList,
      priceElement: this._cachedElement.querySelector<HTMLSpanElement>('.basket__price'),
      submitBtnElement: this._cachedElement.querySelector<HTMLButtonElement>('.basket__button'),
      listItemEmptyElement: listItemEmptyElement
    };
  }

  protected _afterInit(): void {
    const {
      basketList,
      listItemEmptyElement,
      priceElement,
      submitBtnElement
    } = this._cachedData;

    const getPriceBasket = () => this._basketService.getPriceBasket();

    const renderAll = (products: Product[] = []) => {
      basketList.textContent = '';
      this._renderActionsInfo(submitBtnElement, priceElement, listItemEmptyElement, getPriceBasket());
      this._appendBasketElements(basketList, products);
    };

    renderAll();

    this._basketService.onBasket((products: Product[]) => renderAll(products));

    submitBtnElement.addEventListener('click', () => {
      this._statefulEventEmitterService.emit(EventNames.OPEN_ORDER_ADDRESS_PAYMENT);
    });
  }

  private _appendBasketElements(basketList: HTMLUListElement, products: Product[]): void {
    basketList.textContent = '';
    
    for (let i = 0; i < products.length; i++) {
      const basketCardElement = this._basketCardComponent.render(products[i], i);
      basketList.appendChild(basketCardElement);
    }
  }

  private _renderActionsInfo(
    submitBtnElement: HTMLButtonElement,
    priceElement: HTMLSpanElement,
    listItemEmptyElement: HTMLElement,
    priceBasket: number
  ): void {    
    submitBtnElement.disabled = priceBasket === 0;
    priceElement.textContent = `${priceBasket} синапсов`;
    listItemEmptyElement.textContent = priceBasket === 0 ? 'Корзина пуста' : '';
  }
}