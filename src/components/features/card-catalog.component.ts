import { StatefulEventEmitterService } from "../../services/stateful-event-emitter.service";
import { Component, EventNames, Product } from "../../types";
import { cloneTemplate, getCdnImgUrl, getProductCategoryCssClass, getProductPriceText } from "../../utils/utils";

/**
 * Компонент карточки продукта в галерее.
 * 
 * Отвечает за создание DOM-элемента карточки продукта,
 * заполнение его данными продукта и генерацию события при клике.
 */
export class CardCatalogComponent implements Component {
  private readonly _cardCatalogTemplateElement: HTMLTemplateElement;

  constructor(
    private readonly _statefulEventEmitterService: StatefulEventEmitterService
  ) {
    this._cardCatalogTemplateElement = document.querySelector('#card-catalog');
  }

  /**
   * Создаёт DOM-элемент карточки продукта на основе шаблона,
   * заполняет его данными и навешивает обработчик клика.
   * 
   * @param product - объект продукта для отображения
   * @returns HTMLElement - готовый элемент карточки продукта
   */
  render(product: Product): HTMLElement {
    // здесь не происходит поиск в корневом дереве. происходит получение старого элемента по ссылке и каждый раз происходит поиск внутри клонированного элемента. не происходит поиск в корневом дереве. нельзя записывать элементы в this, так как это по функционалу класса метод render может вызываться сколько угодно раз и прошлые клонированные элементы в this не будут хранить реальное состояние
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

  /**
   * Обработчик клика по карточке, который инициирует событие открытия полной информации о продукте.
   * 
   * @param product - продукт, связанный с данной карточкой
   */
  private _cardCatalogClick = (product: Product): void => {
    this._statefulEventEmitterService.emit(EventNames.OPEN_CARD_FULL, product);
  }
}
