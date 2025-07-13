import { ApiOrderService } from "../../services/api-order.service";
import { ApiProductsService } from "../../services/api-products.service";
import { StatefulEventEmitterService } from "../../services/stateful-event-emitter.service";
import { CardCatalogComponent } from "./card-catalog.component";
import { GalleryComponent } from "./gallery.component";
import { ModalCardFullComponent } from "./modal-card-full.component";
import { EventNames, Product } from "../../types";
import { BasketService } from "../../services/basket.service";
import { BasketHeaderComponent } from "./basket-header.component";
import { ModalBasketComponent } from "./modal-basket.component";
import { BasketCardComponent } from "./basket-card.component";
import { OrderService } from "../../services/order.service";
import { ModalPaymentAddressOrderComponent } from "./modal-payment-address-order.component";

export class AppController {
  private readonly _apiOrderService: ApiOrderService;
  private readonly _apiProductsService: ApiProductsService;
  private readonly _statefulEventEmitterService: StatefulEventEmitterService;
  private readonly _cardCatalogComponent: CardCatalogComponent;
  private readonly _galleryComponent: GalleryComponent;
  private readonly _basketHeaderComponent: BasketHeaderComponent;
  private readonly _modalCardFullComponent: ModalCardFullComponent;
  private readonly _basketService: BasketService;
  private readonly _basketCardComponent: BasketCardComponent;
  private readonly _modalBasketComponent: ModalBasketComponent;
  private readonly _orderService: OrderService;
  private readonly _modalPaymentAdressOrderComponent: ModalPaymentAddressOrderComponent;

  constructor() {
    this._apiOrderService = new ApiOrderService();
    this._apiProductsService = new ApiProductsService();
    this._statefulEventEmitterService = new StatefulEventEmitterService();
    this._cardCatalogComponent = new CardCatalogComponent(this._statefulEventEmitterService);
    this._galleryComponent = new GalleryComponent(this._cardCatalogComponent);
    this._basketHeaderComponent = new BasketHeaderComponent(this._statefulEventEmitterService);
    this._basketService = new BasketService(this._statefulEventEmitterService);
    this._modalCardFullComponent = new ModalCardFullComponent(this._basketService);
    this._basketCardComponent = new BasketCardComponent(this._basketService);
    this._modalBasketComponent = new ModalBasketComponent(
      this._basketService,
      this._basketCardComponent,
      this._statefulEventEmitterService
    );
    this._orderService = new OrderService(this._statefulEventEmitterService, this._apiOrderService);
    this._modalPaymentAdressOrderComponent = new ModalPaymentAddressOrderComponent(this._orderService);
  }

  init(): void {
    // this._basketHeaderCounterComponent.setQuantityProductsInBasket(22);
    this._loadProductsAndRender();
    this._initCustomEventListeners();
  }

  private _loadProductsAndRender(): void {
    this._apiProductsService.getAll().then(products => {
      this._galleryComponent.renderProductList(products);
    });
  }

  private _initCustomEventListeners(): void {
    this._statefulEventEmitterService.on(EventNames.OPEN_CARD_FULL, (product: Product) => {
      this._modalCardFullComponent.open(product);
    });

    this._basketService.onBasket(products => {
      this._basketHeaderComponent.setQuantityProductsInBasket(products.length);
    });

    this._statefulEventEmitterService.on(EventNames.OPEN_CART, () => {
      this._modalBasketComponent.open();
    });

    this._statefulEventEmitterService.on(EventNames.OPEN_ORDER_ADDRESS_PAYMENT, () => {
      this._modalPaymentAdressOrderComponent.open();
    });
  }
}