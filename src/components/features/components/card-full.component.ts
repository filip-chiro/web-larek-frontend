import { BasketService } from "../../../services/basket.service";
import { Product } from "../../../types";
import { CardFullData } from "../../../types/components/card-full.component";
import { getCdnImgUrl, getProductCategoryCssClass, getProductPriceText } from "../../../utils/utils";
import { CachedComponent } from "./base/cached.component";

export class CardFullComponent extends CachedComponent<CardFullData> {
  constructor(
    private readonly _basketService: BasketService
  ) {
    const template = document.querySelector<HTMLTemplateElement>('#card-preview'); // получение шаблона
    super(template); // получение узлов из дерева только при старте конструктора
  }

  /**
   * Инициализация кэшированных данных, вызывается при старте конструктора (происходит в CachedComponent)
   * Сохраняет результат вызова этой функции в this._cachedData
   */
  protected _initCachedData(): CardFullData {
    return {
      category: this._clonedTemplate.querySelector<HTMLSpanElement>('.card__category'),
      title: this._clonedTemplate.querySelector<HTMLHeadingElement>('.card__title'),
      img: this._clonedTemplate.querySelector<HTMLImageElement>('.card__image'),
      price: this._clonedTemplate.querySelector<HTMLSpanElement>('.card__price'),
      btn: this._clonedTemplate.querySelector<HTMLButtonElement>('.card__button'),
      product: null
    };
  }
  
  /**
   * Вызывается один раз после старта конструктора и создания this._cachedData
   */
  protected _afterInit(): void {
    this._cachedData.btn.addEventListener('click', () => {
      if (this._cachedData.product !== null) {
        this._renderBtnText(this._cachedData.product);
      }
    });
  }

  /**
   * Вызывается каждый раз, когда вызывается публичный метод render
   */
  protected _update(product: Product): void {
    this._cachedData.product = product;
    this._cachedData.category.textContent = product.category;
    this._cachedData.category.className = '';
    this._cachedData.category.classList.add('card__category', getProductCategoryCssClass(product.category));

    this._cachedData.title.textContent = product.title;
    this._cachedData.img.alt = product.title;
    this._cachedData.img.src = getCdnImgUrl(product.image);
    this._cachedData.price.textContent = getProductPriceText(product.price);

    const isInBasket = this._basketService.getById(product.id);

    if (product.price === null) {
      this._cachedData.btn.disabled = true;
      this._cachedData.btn.textContent = 'Недоступно';
    } else {
      this._cachedData.btn.disabled = false;
      this._cachedData.btn.textContent = isInBasket ? 'Удалить из корзины' : 'Купить';
    }
  }

  private _renderBtnText(product: Product): void {
    const isInBasket = this._basketService.getById(product.id);

    if (isInBasket) {
      this._basketService.remove(product);
      this._cachedData.btn.textContent = 'Купить';
    } else {
      this._basketService.add(product);
      this._cachedData.btn.textContent = 'Удалить из корзины';
    }
  }
}
