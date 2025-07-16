import { BasketService } from "../../services/basket.service";
import { ModalService } from "../../services/modal.service";
import { StatefulEventEmitterService } from "../../services/stateful-event-emitter.service";
import { EventNames, Product } from "../../types";
import { CachedComponent } from "./base/cached.component";
import { BasketCardComponent } from "./basket-card.component";

interface BasketComponentData {
  basketElement: HTMLElement;
  listElement: HTMLUListElement;
  priceElement: HTMLElement;
  submitBtnElement: HTMLButtonElement;
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
    return {
      basketElement: this._cachedElement,
      listElement: this._cachedElement.querySelector<HTMLUListElement>('.basket__list'),
      priceElement: this._cachedElement.querySelector<HTMLSpanElement>('.basket__price'),
      submitBtnElement: this._cachedElement.querySelector<HTMLButtonElement>('.basket__button')
    };
  }

  protected _afterInit(): void {
    const {
      listElement,
      priceElement,
      submitBtnElement
    } = this._cachedData;

    const getPriceBasket = () => this._basketService.getPriceBasket();

    const renderAll = (products: Product[] = []) => {
      listElement.textContent = '';
      this._renderActionsInfo(submitBtnElement, priceElement, listElement, getPriceBasket());
      this._appendBasketElements(listElement, products);
    };

    renderAll();

    const onBasketCallback = (products: Product[]) => renderAll(products);

    this._basketService.onBasket(onBasketCallback);

    submitBtnElement.addEventListener('click', () => {
      this._statefulEventEmitterService.emit(EventNames.OPEN_ORDER_ADDRESS_PAYMENT);
    });
  }

  /**
   * Вспомогательный метод для добавления DOM-элементов товаров в список корзины.
   * 
   * @param listElement - контейнер списка корзины
   * @param products - массив продуктов, которые необходимо отобразить
   */
  private _appendBasketElements(listElement: HTMLUListElement, products: Product[]): void {
    listElement.textContent = '';
    
    for (let i = 0; i < products.length; i++) {
      const basketCardElement = this._basketCardComponent.render(products[i], i);
      listElement.appendChild(basketCardElement);
    }
  }

  /**
   * Вспомогательный метод для обновления информации о стоимости корзины,
   * а также управления состоянием кнопки оформления и отображением пустой корзины.
   * 
   * @param submitBtnElement - кнопка оформления заказа
   * @param priceElement - элемент для отображения общей стоимости
   * @param listElement - контейнер списка корзины
   * @param priceBasket - сумма стоимости товаров в корзине
   */
  private _renderActionsInfo(
    submitBtnElement: HTMLButtonElement,
    priceElement: HTMLSpanElement,
    listElement: HTMLUListElement,
    priceBasket: number
  ): void {
    submitBtnElement.disabled = priceBasket === 0;

    priceElement.textContent = `${priceBasket} синапсов`;
    if (priceBasket === 0) {
      const listItemEmptyElement = document.createElement('div');
      listItemEmptyElement.classList.add('basket__list-empty');
      listItemEmptyElement.textContent = 'Корзина пуста';
      listElement.appendChild(listItemEmptyElement);
    }
  }
}