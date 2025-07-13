import { BasketService } from "../../services/basket.service";
import { StatefulEventEmitterService } from "../../services/stateful-event-emitter.service";
import { EventNames, Product } from "../../types";
import { cloneTemplate, getCdnImgUrl, getProductCategoryCssClass, getProductPriceText } from "../../utils/utils";
import { ModalComponent } from "./modal.component";

export class ModalCardFullComponent extends ModalComponent {
  private readonly _cardFullTemplateElement: HTMLTemplateElement;
  protected override _closeCallback = () => {
  };
  // protected override _openCallback = () => {};

  constructor(
    private readonly _basketService: BasketService
  ) {
    super();
    this._cardFullTemplateElement = document.querySelector('#card-preview');
  }

  open(product: Product): void {
    this._renderModalContentCardFull(product);
    this._open();
  }

  close(): void {
    this._close();
  }

  private _renderModalContentCardFull(product: Product): void {
    const cardFullElement = cloneTemplate(this._cardFullTemplateElement);
    const cardCategory = cardFullElement.querySelector<HTMLSpanElement>('.card__category');
    const cardTitle = cardFullElement.querySelector<HTMLHeadingElement>('.card__title');
    const cardImg = cardFullElement.querySelector<HTMLImageElement>('.card__image');
    const cardPrice = cardFullElement.querySelector<HTMLSpanElement>('.card__price');
    const cardBtn = cardFullElement.querySelector<HTMLButtonElement>('.card__button');

    cardCategory.textContent = product.category;
    cardCategory.classList.remove('card__category_soft');
    cardCategory.classList.add(getProductCategoryCssClass(product.category));
    cardTitle.textContent = product.title;
    cardImg.alt = product.title;
    cardImg.src = getCdnImgUrl(product.image);
    cardPrice.textContent = getProductPriceText(product.price);

    if (product.price === null) cardBtn.disabled = true;

    const isProductInBasket = !!this._basketService.getById(product.id);
    
    if (product.price === null) {
      cardBtn.textContent = 'Недоступно';
    } else if (isProductInBasket) {
      cardBtn.textContent = 'Удалить из корзины';
    } else {
      cardBtn.textContent = 'Купить';
    }

    cardBtn.addEventListener('click', () => this._clickCardBtn(product, cardBtn));

    this._renderModalContent(cardFullElement);
  }

  private _clickCardBtn(product: Product, cardBtn: HTMLButtonElement) {
    const isProductInBasket = !!this._basketService.getById(product.id);    

    if (isProductInBasket) {
      this._basketService.remove(product);
      cardBtn.textContent = 'Купить';
    } else {
      this._basketService.add(product);
      cardBtn.textContent = 'Удалить из корзины';
    }
  }
}