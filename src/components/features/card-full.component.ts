import { BasketService } from "../../services/basket.service";
import { Component, Product } from "../../types";
import { cloneTemplate, getCdnImgUrl, getProductCategoryCssClass, getProductPriceText } from "../../utils/utils";

/**
 * Компонент полной карточки товара с подробной информацией.
 * 
 * Основные обязанности:
 * - Отображать данные товара: категория, название, изображение и цену.
 * - Управлять состоянием кнопки добавления/удаления товара из корзины,
 *   учитывая, доступен ли товар (цена не null) и находится ли он уже в корзине.
 * - Обрабатывать клики по кнопке для добавления или удаления товара из корзины,
 *   синхронизируя состояние с BasketService.
 */
export class CardFullComponent implements Component {
  private readonly _template: HTMLTemplateElement;

  constructor(private readonly _basketService: BasketService) {
    this._template = document.querySelector('#card-preview')!;
  }

  render(product: Product): HTMLElement {
    const element = cloneTemplate(this._template);

    const category = element.querySelector<HTMLSpanElement>('.card__category')!;
    const title = element.querySelector<HTMLHeadingElement>('.card__title')!;
    const img = element.querySelector<HTMLImageElement>('.card__image')!;
    const price = element.querySelector<HTMLSpanElement>('.card__price')!;
    const btn = element.querySelector<HTMLButtonElement>('.card__button')!;

    category.textContent = product.category;
    category.classList.remove('card__category_soft');
    category.classList.add(getProductCategoryCssClass(product.category));

    title.textContent = product.title;
    img.alt = product.title;
    img.src = getCdnImgUrl(product.image);

    price.textContent = getProductPriceText(product.price);

    const isInBasket = !!this._basketService.getById(product.id);

    if (product.price === null) {
      btn.disabled = true;
      btn.textContent = 'Недоступно';
    } else {
      btn.textContent = isInBasket ? 'Удалить из корзины' : 'Купить';
    }

    btn.addEventListener('click', () => this._handleBtnClick(product, btn));

    return element;
  }

  private _handleBtnClick(product: Product, btn: HTMLButtonElement): void {
    const isInBasket = !!this._basketService.getById(product.id);

    if (isInBasket) {
      this._basketService.remove(product);
      btn.textContent = 'Купить';
    } else {
      this._basketService.add(product);
      btn.textContent = 'Удалить из корзины';
    }
  }
}