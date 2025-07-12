import { StatefulEventEmitterService } from "../../services/stateful-event-emitter.service";
import { Product } from "../../types";
import { getCdnImgUrl, getProductCategoryCssClass, getProductPriceText } from "../../utils/utils";

export class CardCatalogComponent {
  private readonly _cardCatalogTemplateElement: HTMLTemplateElement;

  constructor(
    private readonly _statefulEventEmitterService: StatefulEventEmitterService
  ) {
    this._cardCatalogTemplateElement = document.querySelector('#card-catalog');
  }
  
  createElement(product: Product): HTMLElement {
    const cardCatalogElement = this._cardCatalogTemplateElement.content.cloneNode(true) as HTMLElement;
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
    
    return cardCatalogElement;
  }
}
