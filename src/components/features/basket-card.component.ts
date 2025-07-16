import { BasketService } from "../../services/basket.service";
import { Product } from "../../types";
import { RegisteredElement } from "../../types/component";
import { cloneTemplate, getProductPriceText } from "../../utils/utils";
import { StatelessComponent } from "./base/stateless.component";

/**
 * Компонент карточки товара в корзине.
 * 
 * Отвечает за создание HTML-элемента списка товара в корзине,
 * заполнение его данными и обработку удаления товара из корзины.
 */
export class BasketCardComponent extends StatelessComponent<HTMLLIElement> {
  constructor(
    private readonly _basketService: BasketService
  ) {
    super(document.querySelector('#card-basket'));
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