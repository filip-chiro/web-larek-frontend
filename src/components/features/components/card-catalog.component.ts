import { StatefulEventEmitterService } from "../../../services/stateful-event-emitter.service";
import { EventNames, Product } from "../../../types";
import { RegisteredElement } from "../../../types/components/base/component";
import { getCdnImgUrl, getProductCategoryCssClass, getProductPriceText } from "../../../utils/utils";
import { StatelessComponent } from "./base/stateless.component";

export class CardCatalogComponent extends StatelessComponent {
  constructor(
    private readonly _statefulEventEmitterService: StatefulEventEmitterService
  ) {
    super(document.querySelector('#card-catalog'));
  }

  render(product: Product): RegisteredElement {
    const cardCatalogElement = this._cloneTemplate();
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

  /**
   * Обработчик клика по карточке, который инициирует событие открытия полной информации о продукте.
   * 
   * @param product - продукт, связанный с данной карточкой
   */
  private _cardCatalogClick = (product: Product): void => {
    this._statefulEventEmitterService.emit(EventNames.OPEN_CARD_FULL, product);
  }
}
