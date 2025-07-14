import { Product } from "../../types";
import { CardCatalogComponent } from "./card-catalog.component";

/**
 * Компонент галереи, отвечающий за отображение списка продуктов.
 * 
 * Основная задача:
 * - Рендерить список продуктов, создавая для каждого карточку с помощью CardCatalogComponent
 *   и добавляя их в DOM-элемент галереи.
 */
export class GalleryComponent {
  private readonly _galleryElement: HTMLElement;

  constructor(
    private readonly _cardCatalogComponent: CardCatalogComponent
  ) {
    this._galleryElement = document.querySelector('.gallery');
  }

  /**
   * Создаёт и добавляет в галерею карточки продуктов.
   * 
   * @param products - массив продуктов для отображения в галерее
   */
  renderProductList(products: Product[]): void {
    for (const product of products) {
      const cardElement = this._cardCatalogComponent.render(product);
      this._galleryElement.append(cardElement);
    }
  }

}