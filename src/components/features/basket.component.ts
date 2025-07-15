import { BasketService } from "../../services/basket.service";
import { ModalService } from "../../services/modal.service";
import { StatefulEventEmitterService } from "../../services/stateful-event-emitter.service";
import { Component, EventNames, Product } from "../../types";
import { cloneTemplate } from "../../utils/utils";
import { BasketCardComponent } from "./basket-card.component";

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
export class BasketComponent implements Component {
  private readonly _basketTemplate: HTMLTemplateElement;

  constructor(
    private readonly _basketService: BasketService,
    private readonly _basketCardComponent: BasketCardComponent,
    private readonly _statefulEventEmitterService: StatefulEventEmitterService,
    private readonly _modalService: ModalService
  ) {
    this._basketTemplate = document.querySelector('#basket')!;
  }

  /**
   * Рендерит корзину, создавая DOM-элемент на основе шаблона и текущего состояния корзины.
   * Устанавливает обработчики кликов и подписки на изменения корзины.
   * 
   * @returns HTMLElement, готовый к вставке в DOM.
   */
  render(): HTMLElement {
    // здесь не происходит поиск в корневом дереве. происходит получение старого элемента по ссылке и каждый раз происходит поиск внутри клонированного элемента. не происходит поиск в корневом дереве. нельзя записывать элементы в this, так как это по функционалу класса метод render может вызываться сколько угодно раз и прошлые клонированные элементы в this не будут хранить реальное состояние
    const basketElement = cloneTemplate(this._basketTemplate);
    const listElement = basketElement.querySelector<HTMLUListElement>('.basket__list')!;
    const priceElement = basketElement.querySelector<HTMLSpanElement>('.basket__price')!;
    const submitBtnElement = basketElement.querySelector<HTMLButtonElement>('.basket__button')!;
    const getPriceBasket = () => this._basketService.getPriceBasket();

    const renderAll = () => {
      listElement.textContent = '';
      this._renderActionsInfo(submitBtnElement, priceElement, listElement, getPriceBasket());
      this._appendBasketElements(listElement, this._basketService.getAll());
    };

    renderAll();

    const onBasketCallback = () => renderAll();

    submitBtnElement.addEventListener('click', () => {
      this._statefulEventEmitterService.emit(EventNames.OPEN_ORDER_ADDRESS_PAYMENT);
      this._basketService.offBasket(onBasketCallback);
    });

    this._basketService.onBasket(onBasketCallback);

    // Удаление подписки при закрытии
    this._modalService.onClose(this, () => {
      this._basketService.offBasket(onBasketCallback);
    });

    return basketElement;
  }

  /**
   * Вспомогательный метод для добавления DOM-элементов товаров в список корзины.
   * 
   * @param listElement - контейнер списка корзины
   * @param products - массив продуктов, которые необходимо отобразить
   */
  private _appendBasketElements(listElement: HTMLUListElement, products: Product[]): void {
    for (let i = 0; i < products.length; i++) {
      const basketCardElement = this._basketCardComponent.createElement(products[i], i);
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
    if (priceBasket === 0) submitBtnElement.disabled = true;
    priceElement.textContent = `${priceBasket} синапсов`;
    if (priceBasket === 0) {
      const listItemEmptyElement = document.createElement('div');
      listItemEmptyElement.classList.add('basket__list-empty');
      listItemEmptyElement.textContent = 'Корзина пуста';
      listElement.appendChild(listItemEmptyElement);
    }
  }
}