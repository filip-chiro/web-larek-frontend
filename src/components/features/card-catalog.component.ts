import { StatefulEventEmitterService } from "../../services/stateful-event-emitter.service";
import { EventNames, Product } from "../../types";
import { cloneTemplate, getCdnImgUrl, getProductCategoryCssClass, getProductPriceText } from "../../utils/utils";

export class CardCatalogComponent {
  private readonly _cardCatalogTemplateElement: HTMLTemplateElement;

  constructor(
    private readonly _statefulEventEmitterService: StatefulEventEmitterService
  ) {
    this._cardCatalogTemplateElement = document.querySelector('#card-catalog');
  }
  
  createElement(product: Product): HTMLElement {
    const cardCatalogElement = cloneTemplate(this._cardCatalogTemplateElement);
    const cardCategory = cardCatalogElement.querySelector<HTMLSpanElement>('.card__category');
    const cardTitle = cardCatalogElement.querySelector<HTMLHeadingElement>('.card__title');
    const cardImg = cardCatalogElement.querySelector<HTMLImageElement>('.card__image');
    const cardPrice = cardCatalogElement.querySelector<HTMLSpanElement>('.card__price');

    cardCategory.textContent = product.category;
    cardCategory.classList.remove('card__category_soft');
    cardCategory.classList.add(getProductCategoryCssClass(product.category));
    cardTitle.textContent = product.title;
    cardImg.alt = product.title;
    cardImg.src = getCdnImgUrl(product.image);
    cardPrice.textContent = getProductPriceText(product.price);

    cardCatalogElement.addEventListener('click', () => this._cardCatalogClick(product));
    
    return cardCatalogElement;
  }

  private _cardCatalogClick = (product: Product): void => {
    this._statefulEventEmitterService.emit(EventNames.OPEN_CARD_FULL, product);
  }
}
