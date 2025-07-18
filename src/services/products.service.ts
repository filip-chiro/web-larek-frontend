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
   * Загружает список продуктов с API, эмитит событие об обновлении продуктов и подписывается на изменения.
   * 
   * @param callback Функция, которая вызывается при каждом обновлении списка продуктов.
   * @param onDestroy Опциональная функция, принимающая колбэк для отписки от события.
   *                  Колбэк нужно вызвать, чтобы прекратить подписку (например, при размонтировании компонента).
   */
  getAll(
    callback: (products: Product[]) => void,
    onDestroy?: (unsubscribe: () => void) => void
  ): void {
  this._apiProductsService.getAll()
    .then(products => {
      // Сразу эмитируем полученные продукты
      this._update(products);

      const _callback = (products: Product[]) => {
        callback(products);
      };
      // Подписываемся на обновления через callback
      this._statefulEventEmitterService.onCached<Product[]>(EventNames.PRODUCTS_CHANGED, _callback);

      // Позволяем внешнему коду отписаться при необходимости
      if (onDestroy) {
        onDestroy(() => {
          this._statefulEventEmitterService.off(EventNames.PRODUCTS_CHANGED, _callback);
        });
      }
    })
    .catch(error => {
      console.error('Ошибка при попытке загрузить список товаров', error);
    });
  }

  /**
   * Эмитит событие об обновлении продуктов
   * @param products Список продуктов
   */
  private _update(products: Product[]): void {
    this._statefulEventEmitterService.emitCached(EventNames.PRODUCTS_CHANGED, products)
  }
}