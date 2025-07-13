import { BasketService } from "../../services/basket.service";
import { Product } from "../../types";
import { cloneTemplate, getProductPriceText } from "../../utils/utils";

export class BasketCardComponent {
  private readonly _basketCardTemplate: HTMLTemplateElement;

  constructor(
    private readonly _basketService: BasketService
  ) {
    this._basketCardTemplate = document.querySelector('#card-basket');
  }

  createElement(product: Product, index: number): HTMLLIElement {
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

  private _deleteProduct = (product: Product): void => {
    this._basketService.remove(product);
  }
}