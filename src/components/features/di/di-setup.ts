import { AppController } from "../../../app.controller";
import { ApiOrderService } from "../../../services/api-order.service";
import { ApiProductsService } from "../../../services/api-products.service";
import { BasketService } from "../../../services/basket.service";
import { ComponentRegistryService } from "../../../services/component-registry.service";
import { ModalService } from "../../../services/modal.service";
import { OrderService } from "../../../services/order.service";
import { ProductsService } from "../../../services/products.service";
import { StatefulEventEmitterService } from "../../../services/stateful-event-emitter.service";
import { ValidationOrderService } from "../../../services/validation-order.service";
import { BasketCardComponent } from "../components/basket-card.component";
import { BasketComponent } from "../components/basket.component";
import { CardCatalogComponent } from "../components/card-catalog.component";
import { CardFullComponent } from "../components/card-full.component";
import { EmailPhoneOrderComponent } from "../components/email-phone-order.component";
import { ModalComponent } from "../components/base/modal.component";
import { PaymentAddressOrderComponent } from "../components/payment-address-order.component";
import { SuccessOrderComponent } from "../components/succes-order.component";
import { container } from "./di-container";
import { GalleryController } from "../controllers/gallery.controller";
import { BasketHeaderController } from "../controllers/basket-header.controller";

/**
 * Регистрирует все необходимые зависимости в глобальном DI контейнере.
 * 
 * Выполняет регистрацию сервисов, компонентов и контроллеров с указанием их зависимостей,
 * что позволяет контейнеру управлять созданием экземпляров и их инъекцией.
 * 
 * Используется для единой централизованной настройки всех классов приложения,
 * чтобы при запросе нужного класса контейнер мог автоматически разрешить
 * и передать все необходимые зависимости.
 */
export function registerDependencies() {
  container.register(ComponentRegistryService);
  container.register(ApiOrderService);
  container.register(ApiProductsService);
  container.register(StatefulEventEmitterService);
  container.register(ValidationOrderService);
  container.register(ModalComponent);
  container.register(ModalService, { deps: [ModalComponent, ComponentRegistryService] });

  container.register(CardCatalogComponent, { deps: [StatefulEventEmitterService] });
  container.register(GalleryController, { deps: [CardCatalogComponent] });
  container.register(BasketHeaderController, { deps: [StatefulEventEmitterService] });
  container.register(BasketService, { deps: [StatefulEventEmitterService] });
  container.register(CardFullComponent, { deps: [BasketService] });
  container.register(BasketCardComponent, { deps: [BasketService] });
  container.register(BasketComponent, { deps: [BasketService, BasketCardComponent, StatefulEventEmitterService] });
  container.register(OrderService, { deps: [StatefulEventEmitterService, ValidationOrderService, ApiOrderService, BasketService] });
  container.register(PaymentAddressOrderComponent, { deps: [OrderService, StatefulEventEmitterService, ModalService] });
  container.register(EmailPhoneOrderComponent, { deps: [OrderService, ModalService, BasketService] });
  container.register(SuccessOrderComponent, { deps: [ModalService] });
  container.register(ProductsService, { deps: [ApiProductsService, StatefulEventEmitterService] });

  container.register(AppController, {
    deps: [
      StatefulEventEmitterService,
      ModalService,
      GalleryController,
      BasketHeaderController,
      BasketService,
      CardFullComponent,
      BasketComponent,
      PaymentAddressOrderComponent,
      EmailPhoneOrderComponent,
      SuccessOrderComponent,
      ProductsService
    ]
  });
}