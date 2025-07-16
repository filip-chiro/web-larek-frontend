import { Product } from "../../../types";
import { CardCatalogComponent } from "../components/card-catalog.component";

export class GalleryController {
  private readonly _galleryElement: HTMLElement;

  constructor(
    private readonly _cardCatalogComponent: CardCatalogComponent
  ) {
    this._galleryElement = document.querySelector('.gallery');
  }

  renderProductList(products: Product[]): void {
    this._galleryElement.innerHTML = '';
    
    for (const product of products) {
      const cardElement = this._cardCatalogComponent.render(product);
      this._galleryElement.append(cardElement);
    }
  }

}
