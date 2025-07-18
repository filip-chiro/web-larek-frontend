import { BasketService } from "../../../services/basket.service";
import { Product } from "../../../types";
import { RegisteredElement } from "../../../types/components/base/component";
import { getProductPriceText } from "../../../utils/utils";
import { StatelessComponent } from "./base/stateless.component";

export class BasketCardComponent extends StatelessComponent<HTMLLIElement> {
  constructor(
    private readonly _basketService: BasketService
  ) {
    const template = document.querySelector<HTMLTemplateElement>('#card-basket'); // получение шаблона при старте конструктора
    super(template);
  }

  render(product: Product, index: number): RegisteredElement<HTMLLIElement> {
    const basketCardElement = this._cloneTemplate();
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
