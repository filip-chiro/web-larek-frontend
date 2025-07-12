import { Product } from "../../types";
import { CardCatalogComponent } from "./card-catalog.component";

export class GalleryComponent {
  private readonly _galleryElement: HTMLElement;

  constructor(
    private readonly _cardCatalogComponent: CardCatalogComponent
  ) {
    this._galleryElement = document.querySelector('.gallery');
  }

  renderProductList(products: Product[]): void {
    for (const product of products) {
      const cardElement = this._cardCatalogComponent.createElement(product);
      this._galleryElement.append(cardElement);
    }
  }

}