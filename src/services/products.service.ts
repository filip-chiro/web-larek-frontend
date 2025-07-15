import { EventNames, Product } from "../types";
import { ApiProductsService } from "./api-products.service";
import { StatefulEventEmitterService } from "./stateful-event-emitter.service";

/**
 * Сервис модели для работы с продуктами.
 * 
 * Основные обязанности:
 * - Загружает данные о продуктах с API.
 * - Хранит последнее состояние полученных данных.
 * - Рассылает изменения подписчикам через событийную шину (`StatefulEventEmitterService`).
 * - Позволяет реактивно или лениво подписаться на данные с возможностью отмены ожидания.
 *
 * Архитектурная роль:
 * - Является моделью данных для продуктов в терминах паттерна MV*.
 * - Представление (например, компонент галереи) не взаимодействует напрямую с API, 
 *   а обращается к сервису модели, получая данные через `getAll()`.
 * - Это обеспечивает разделение ответственности: данные загружаются и управляются здесь,
 *   а представление только подписывается или ждёт результат.
 *
 * Преимущества:
 * - Централизованное хранение и распространение состояния.
 * - Унифицированный интерфейс подписки и отписки.
 * - Готов к расширению: можно добавить фильтрацию, кеширование, ошибки и т. д.
 */
export class ProductsService {
  constructor(
    private readonly _apiProductsService: ApiProductsService,
    private readonly _statefulEventEmitterService: StatefulEventEmitterService
  ) {}

/**
 * Загружает список продуктов с сервера и возвращает их в виде Promise.
 * После загрузки данные также публикуются через `StatefulEventEmitterService`
 * с событием `PRODUCTS_CHANGED`, и подписка осуществляется на него.
 *
 * Если данные уже были загружены ранее и сохранены, они будут
 * возвращены из кеша моментально.
 *
 * @param onDestroy Функция, которая принимает колбэк `unsubscribe`.
 *                  Этот колбэк нужно вызвать в случае, если необходимо
 *                  отменить ожидание события (например, при размонтировании компонента)
 *
 * @returns Promise, который резолвится с массивом продуктов, 
 *          как только будет эмитировано событие `PRODUCTS_CHANGED`
 */
  getAll(onDestroy?: (unsubscribe: () => void) => void): Promise<Product[]> {
    return this._apiProductsService.getAll()
      .then(products => {
        this._statefulEventEmitterService.emit(EventNames.PRODUCTS_CHANGED, products);
        return this._statefulEventEmitterService.waitFor<Product[]>(
          EventNames.PRODUCTS_CHANGED,
          onDestroy
        );
      });
  }
}