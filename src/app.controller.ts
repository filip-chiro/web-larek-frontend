import { BasketComponent } from "./components/features/components/basket.component";
import { CardFullComponent } from "./components/features/components/card-full.component";
import { EmailPhoneOrderComponent } from "./components/features/components/email-phone-order.component";
import { PaymentAddressOrderComponent } from "./components/features/components/payment-address-order.component";
import { SuccessOrderComponent } from "./components/features/components/succes-order.component";
import { BasketHeaderController } from "./components/features/controllers/basket-header.controller";
import { GalleryController } from "./components/features/controllers/gallery.controller";
import { BasketService } from "./services/basket.service";
import { ModalService } from "./services/modal.service";
import { ProductsService } from "./services/products.service";
import { StatefulEventEmitterService } from "./services/stateful-event-emitter.service";
import { CreateOrderResponse, EventNames, Product } from "./types";

/**
 * Главный контроллер приложения, отвечающий за инициализацию и
 * координацию взаимодействия между сервисами, компонентами и модальными окнами.
 * 
 * Основные обязанности:
 * - Загрузка списка продуктов и передача их в галерею для отображения.
 * - Подписка на кастомные события приложения для открытия соответствующих модальных окон.
 * - Обновление информации о корзине в шапке при изменениях.
 * 
 * Этот класс служит точкой входа для запуска логики приложения
 * и организации реактивного взаимодействия между слоями.
 */
export class AppController {
  constructor(
    private readonly _statefulEventEmitterService: StatefulEventEmitterService,
    private readonly _modalService: ModalService,
    private readonly _galleryController: GalleryController,
    private readonly _basketHeaderController: BasketHeaderController,
    private readonly _basketService: BasketService,
    private readonly _cardFullComponent: CardFullComponent,
    private readonly _basketComponent: BasketComponent,
    private readonly _paymentAddressOrderComponent: PaymentAddressOrderComponent,
    private readonly _emailPhoneOrderComponent: EmailPhoneOrderComponent,
    private readonly _successOrderComponent: SuccessOrderComponent,
    private readonly _productsService: ProductsService
  ) {}

  /**
   * Инициализирует приложение:
   * - загружает продукты и отображает их в галерее;
   * - устанавливает обработчики кастомных событий для управления модальными окнами и корзиной.
   */
  init(): void {
    this._loadProductsAndRender();
    this._initCustomEventListeners();
  }

/**
 * Загружает список продуктов через сервис-адаптер `ProductsService` и передаёт их в компонент галереи.
 * Продукты реактивно передаются из модели (`StatefulEventEmitterService`), которая обновляется адаптером.
 * Представление получает данные через адаптер, не взаимодействуя напрямую с API или моделью
 */
  private _loadProductsAndRender(): void {
    this._productsService.getAll((products: Product[]) => {      
      this._galleryController.renderProductList(products);
    });
  }

  /**
   * Инициализирует подписки на кастомные события приложения.
   * Обрабатывает открытие различных модальных окон и обновление корзины.
   * @private
   */
  private _initCustomEventListeners(): void {
    this._statefulEventEmitterService.on(EventNames.OPEN_CARD_FULL, (product: Product) => {
      this._modalService.open(this._cardFullComponent.render(product));
    });

    this._basketService.onBasket(products => {
      this._basketHeaderController.setQuantityProductsInBasket(products.length);
    });

    this._statefulEventEmitterService.on(EventNames.OPEN_CART, () => {
      this._modalService.open(this._basketComponent);
    });

    this._statefulEventEmitterService.on(EventNames.OPEN_ORDER_ADDRESS_PAYMENT, () => {
      this._modalService.open(this._paymentAddressOrderComponent);
    });

    this._statefulEventEmitterService.on(EventNames.OPEN_ORDER_EMAIL_PHONE, () => {
      this._modalService.open(this._emailPhoneOrderComponent);
    });

    this._statefulEventEmitterService.on(EventNames.OPEN_SUCCESS_ORDER, (res: CreateOrderResponse) => {      
      this._modalService.open(this._successOrderComponent.render(res));
    });
  }
}