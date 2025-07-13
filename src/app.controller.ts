import { BasketCardComponent } from "./components/features/basket-card.component";
import { BasketHeaderComponent } from "./components/features/basket-header.component";
import { CardCatalogComponent } from "./components/features/card-catalog.component";
import { GalleryComponent } from "./components/features/gallery.component";
import { ModalBasketComponent } from "./components/features/modal-basket.component";
import { ModalCardFullComponent } from "./components/features/modal-card-full.component";
import { ModalEmailPhoneOrderComponent } from "./components/features/modal-email-phone-order.component";
import { ModalPaymentAddressOrderComponent } from "./components/features/modal-payment-address-order.component";
import { ModalSuccessOrderComponent } from "./components/features/modal-succes-order.component";
import { ApiOrderService } from "./services/api-order.service";
import { ApiProductsService } from "./services/api-products.service";
import { BasketService } from "./services/basket.service";
import { OrderService } from "./services/order.service";
import { StatefulEventEmitterService } from "./services/stateful-event-emitter.service";
import { EventNames, Product } from "./types";

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
  private readonly _modalEmailPhoneOrderComponent: ModalEmailPhoneOrderComponent;
  private readonly _modalSuccessOrderComponent: ModalSuccessOrderComponent;

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
    this._modalPaymentAdressOrderComponent = new ModalPaymentAddressOrderComponent(
      this._orderService,
      this._statefulEventEmitterService
    );
    this._modalEmailPhoneOrderComponent = new ModalEmailPhoneOrderComponent(
      this._orderService,
      this._statefulEventEmitterService,
      this._basketService
    );
    this._modalSuccessOrderComponent = new ModalSuccessOrderComponent(
      this._basketService,
      this._orderService
    );
  }

  init(): void {
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

    this._statefulEventEmitterService.on(EventNames.OPEN_ORDER_EMAIL_PHONE, () => {
      this._modalEmailPhoneOrderComponent.open();
    });

    this._statefulEventEmitterService.on(EventNames.OPEN_SUCCESS_ORDER, () => {
      this._modalSuccessOrderComponent.open();
    });
  }
}