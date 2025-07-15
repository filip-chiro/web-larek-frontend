import { BasketService } from "../../services/basket.service";
import { Component, Product } from "../../types";
import { cloneTemplate, getProductPriceText } from "../../utils/utils";

/**
 * Компонент карточки товара в корзине.
 * 
 * Отвечает за создание HTML-элемента списка товара в корзине,
 * заполнение его данными и обработку удаления товара из корзины.
 */
export class BasketCardComponent implements Component {
  private readonly _basketCardTemplate: HTMLTemplateElement;

  constructor(
    private readonly _basketService: BasketService
  ) {
    this._basketCardTemplate = document.querySelector('#card-basket');
  }

  /**
   * Создаёт DOM-элемент для товара в корзине на основе шаблона,
   * заполняет элемент информацией о товаре и индексом,
   * навешивает обработчик для кнопки удаления товара.
   * 
   * @param product - объект товара для отображения
   * @param index - индекс товара в списке корзины (для отображения порядкового номера)
   * @returns HTMLLIElement - готовый элемент товара в корзине
   */
  render(product: Product, index: number): HTMLLIElement {
    const basketCardElement = cloneTemplate<HTMLLIElement>(this._basketCardTemplate);
    const basketItemIndexElemet = basketCardElement.querySelector<HTMLSpanElement>('.basket__item-index');
    const basketItemTitleElement = basketCardElement.querySelector<HTMLSpanElement>('.card__title');
    const basketItemPriceElement = basketCardElement.querySelector<HTMLSpanElement>('.card__price');
    const basketItemDeleteBtnElement = basketCardElement.querySelector<HTMLButtonElement>('.basket__item-delete');

    basketItemIndexElemet.textContent = `${index + 1}`
    basketItemTitleElement.textContent = product.title;
    basketItemPriceElement.textContent = getProductPriceText(product.price);
    basketItemDeleteBtnElement.addEventListener('click', () => this._deleteProduct(product));

    return basketCardElement;
  }

  /**
   * Обработчик удаления товара из корзины.
   * Вызывает метод сервиса корзины для удаления переданного товара.
   * 
   * @param product - товар, который нужно удалить из корзины
   */
  private _deleteProduct = (product: Product): void => {
    this._basketService.remove(product);
  }
}