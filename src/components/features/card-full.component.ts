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
    this._cachedData.category.className = '';
    this._cachedData.btn.addEventListener('click', () => {
      if (this._cachedData.product !== null) {
        this._renderBtnText(this._cachedData.product, this._cachedData.btn);
      }
    });
  }

  protected _update(product: Product): void {
    const {
      category,
      title,
      img,
      price,
      btn
    } = this._cachedData

    this._cachedData.product = product;
    category.textContent = product.category;
    category.className = '';
    category.classList.add('card__category', getProductCategoryCssClass(product.category));

    title.textContent = product.title;
    img.alt = product.title;
    img.src = getCdnImgUrl(product.image);
    price.textContent = getProductPriceText(product.price);

    const isInBasket = this._basketService.getById(product.id);

    if (product.price === null) {
      btn.disabled = true;
      btn.textContent = 'Недоступно';
    } else {
      btn.disabled = false;
      btn.textContent = isInBasket ? 'Удалить из корзины' : 'Купить';
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