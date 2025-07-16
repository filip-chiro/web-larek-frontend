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
import { BasketCardComponent } from "../basket-card.component";
import { BasketHeaderComponent } from "../basket-header.component";
import { BasketComponent } from "../basket.component";
import { CardCatalogComponent } from "../card-catalog.component";
import { CardFullComponent } from "../card-full.component";
import { EmailPhoneOrderComponent } from "../email-phone-order.component";
import { GalleryComponent } from "../gallery.component";
import { ModalComponent } from "../modal.component";
import { PaymentAddressOrderComponent } from "../payment-address-order.component";
import { SuccessOrderComponent } from "../succes-order.component";
import { container } from "./di-container";

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
  container.register(ModalService, { deps: [ModalComponent] });

  container.register(CardCatalogComponent, { deps: [StatefulEventEmitterService] });
  container.register(GalleryComponent, { deps: [CardCatalogComponent] });
  container.register(BasketHeaderComponent, { deps: [StatefulEventEmitterService] });
  container.register(BasketService, { deps: [StatefulEventEmitterService] });
  container.register(CardFullComponent, { deps: [BasketService] });
  container.register(BasketCardComponent, { deps: [BasketService] });
  container.register(BasketComponent, { deps: [BasketService, BasketCardComponent, StatefulEventEmitterService, ModalService] });
  container.register(OrderService, { deps: [StatefulEventEmitterService, ValidationOrderService, ApiOrderService, BasketService] });
  container.register(PaymentAddressOrderComponent, { deps: [OrderService, StatefulEventEmitterService, ModalService] });
  container.register(EmailPhoneOrderComponent, { deps: [OrderService, ModalService, BasketService] });
  container.register(SuccessOrderComponent, { deps: [ModalService] });
  container.register(ProductsService, { deps: [ApiProductsService, StatefulEventEmitterService] });

  container.register(AppController, {
    deps: [
      StatefulEventEmitterService,
      ModalService,
      GalleryComponent,
      BasketHeaderComponent,
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