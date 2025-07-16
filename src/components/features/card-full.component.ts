import { BasketService } from "../../services/basket.service";
import { Product } from "../../types";
import { getCdnImgUrl, getProductCategoryCssClass, getProductPriceText } from "../../utils/utils";
import { CachedComponent } from "./base/cached.component";

interface CardFullData {
  category: HTMLSpanElement;
  title: HTMLHeadingElement;
  img: HTMLImageElement;
  price: HTMLSpanElement;
  btn: HTMLButtonElement;
  product: Product
}

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
export class CardFullComponent extends CachedComponent<CardFullData> {
  protected readonly _template: HTMLTemplateElement;

  constructor(
    private readonly _basketService: BasketService
  ) {
    super(document.querySelector('#card-preview'));
  }

  protected _initCachedData(): CardFullData {
    return {
      category: this._cachedElement.querySelector<HTMLSpanElement>('.card__category'),
      title: this._cachedElement.querySelector<HTMLHeadingElement>('.card__title'),
      img: this._cachedElement.querySelector<HTMLImageElement>('.card__image'),
      price: this._cachedElement.querySelector<HTMLSpanElement>('.card__price'),
      btn: this._cachedElement.querySelector<HTMLButtonElement>('.card__button'),
      product: null
    };
  }

  protected _afterInit(): void {
    this._cachedData.category.classList.remove('card__category_soft');
    this._cachedData.btn.addEventListener('click', () => {
      if (this._cachedData.product !== null) {
        this._renderBtnText(this._cachedData.product, this._cachedData.btn);
      }
    });
  }

  protected _update(product: Product): void {
    this._cachedData.product = product;
    this._cachedData.category.textContent = product.category;
    this._cachedData.category.classList.add(getProductCategoryCssClass(product.category));

    this._cachedData.title.textContent = product.title;
    this._cachedData.img.alt = product.title;
    this._cachedData.img.src = getCdnImgUrl(product.image);

    this._cachedData.price.textContent = getProductPriceText(product.price);

    const isInBasket = this._basketService.getById(product.id);

    if (product.price === null) {
      this._cachedData.btn.disabled = true;
      this._cachedData.btn.textContent = 'Недоступно';
    } else {
      this._cachedData.btn.textContent = isInBasket ? 'Удалить из корзины' : 'Купить';
    }
  }

  private _renderBtnText(product: Product, btn: HTMLButtonElement): void {
    const isInBasket = this._basketService.getById(product.id);

    if (isInBasket) {
      this._basketService.remove(product);
      btn.textContent = 'Купить';
    } else {
      this._basketService.add(product);
      btn.textContent = 'Удалить из корзины';
    }
  }
}