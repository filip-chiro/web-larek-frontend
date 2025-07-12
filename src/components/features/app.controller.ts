import { ApiOrderService } from "../../services/api-order.service";
import { ApiProductsService } from "../../services/api-products.service";
import { StatefulEventEmitterService } from "../../services/stateful-event-emitter.service";
import { CardCatalogComponent } from "./card-catalog.component";
import { GalleryComponent } from "./gallery.component";

export class AppController {
  private readonly _apiOrderService: ApiOrderService;
  private readonly _apiProductsService: ApiProductsService;
  private readonly _statefulEventEmitterService: StatefulEventEmitterService;
  private readonly _cardCatalogComponent: CardCatalogComponent;
  private readonly _galleryComponent: GalleryComponent;
  // нужно создать компонент BasketIconComponent
  // BasketIconComponent.setQuantityProductsInBasket(2)
  // BasketIconComponent.setQuantityProductsInBasket(3)

  constructor() {
    this._apiOrderService = new ApiOrderService();
    this._apiProductsService = new ApiProductsService();
    this._statefulEventEmitterService = new StatefulEventEmitterService();
    this._cardCatalogComponent = new CardCatalogComponent(this._statefulEventEmitterService);
    this._galleryComponent = new GalleryComponent(this._cardCatalogComponent);
  }

  init() {
    this._loadProductsAndRender();
  }

  private _loadProductsAndRender(): void {
    this._apiProductsService.getAll().then(products => {
      this._galleryComponent.renderProductList(products);
    });
  }
}