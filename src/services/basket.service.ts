import { EventNames, Product } from "../types";
import { StatefulEventEmitterService } from "./stateful-event-emitter.service";

/**
 * Сервис корзины (BasketService) управляет списком товаров в корзине.
 * Все операции обновления и получения данных корзины выполняются
 * через StatefulEventEmitterService и события.
 */
export class BasketService {
  constructor(
    private readonly _statefulEventEmitterService: StatefulEventEmitterService
  ) {
    this._setProducts([]);
  }

  /**
   * Получить все товары в корзине.
   * Возвращает пустой массив, если корзина пуста.
   * @returns {Product[]} Массив товаров в корзине.
   */
  getAll(): Product[] {
    const productsInBasket = this._statefulEventEmitterService.getLast(EventNames.BASKET_CHANGED);

    if (productsInBasket === undefined) {
      return [];
    }

    return productsInBasket;
  }

  /**
   * Получить товар из корзины по его ID.
   * @param {string} id Идентификатор товара.
   * @returns {Product | undefined} Найденный товар или undefined, если не найден.
   */
  getById(id: string): Product | undefined {
    const productsInBasket = this.getAll();

    const product = productsInBasket.find(product => product.id === id);
  
    return product;
  }

  /**
   * Получить общую стоимость товаров в корзине.
   * Суммирует поле price у всех товаров, учитывая, что цена может отсутствовать.
   * @returns {number} Общая стоимость корзины.
   */
  getPriceBasket(): number {
    const productsInBasket = this.getAll();
    const price = productsInBasket.reduce((acc, product) => acc + (product.price || 0), 0);
    
    return price;
  }

  /**
   * Добавить товар в корзину.
   * Если товар уже есть, добавление игнорируется.
   * После добавления эмитит событие с обновлённым списком товаров,
   * а также специальное событие добавления по ID товара.
   * @param {Product} product Добавляемый товар.
   */
  add(product: Product): void {
    const productsInBasket = this.getAll();

    if (productsInBasket.find((item) => item.id === product.id)) {
      return;
    }

    this._statefulEventEmitterService.emitCached(`add-card-to-basket-${product.id}`, product);
    this._statefulEventEmitterService.offAllByEventName(`remove-card-to-basket-${product.id}`);
    this._statefulEventEmitterService.emitCached(EventNames.BASKET_CHANGED, [...productsInBasket, product]);
  }

  /**
   * Удалить товар из корзины.
   * После удаления эмитит событие с обновлённым списком товаров,
   * а также специальное событие удаления по ID товара.
   * @param {Product} product Удаляемый товар.
   */
  remove(product: Product): void {
    const productsInBasket = this.getAll();
    const filteredProductsInBasket = productsInBasket.filter(item => item.id !== product.id);

    this._statefulEventEmitterService.offAllByEventName(`add-card-to-basket-${product.id}`);
    this._statefulEventEmitterService.emitCached(`remove-card-to-basket-${product.id}`, product);
    this._statefulEventEmitterService.emitCached(EventNames.BASKET_CHANGED, filteredProductsInBasket);
  }

  /**
   * Подписаться на обновления корзины.
   * Вызывается при каждом изменении списка товаров, с возможностью отписки
   * @param {(products: Product[]) => void} callback Коллбек с массивом товаров.
   */
  onBasket(callback: (products: Product[]) => void): { unsubscribe: () => void } {
    this._statefulEventEmitterService.onCached(EventNames.BASKET_CHANGED, callback);

    return {
      unsubscribe: () => this._offBasket(callback)
    };
  }

  /**
   * Подписаться на добавление конкретного товара по ID.
   * Вызывается при добавлении этого товара в корзину.
   * @param {string} id ID товара.
   * @param {(product: Product) => void} callback Коллбек с товаром.
   */
  onBasketById(id: string, callback: (product: Product) => void) {
    this._statefulEventEmitterService.onCached(`add-card-to-basket-${id}`, callback);
  }

  /**
   * Отписаться от событий добавления конкретного товара по ID.
   * Удаляет все обработчики для события добавления товара с данным ID.
   * @param {string} id ID товара.
   */
  offBasketById(id: string): void {
    this._statefulEventEmitterService.offAllByEventName(`add-card-to-basket-${id}`);
  }

  /**
   * Очистить корзину — удалить все товары.
   * Эмитит событие с пустым списком.
   */
  clear(): void {
    this._statefulEventEmitterService.emitCached(EventNames.BASKET_CHANGED, []);
  }

  /**
   * Отписаться от обновлений корзины.
   * @param {(products: Product[]) => void} callback Ранее добавленный обработчик.
   */
  private _offBasket(callback: (products: Product[]) => void): void {
    this._statefulEventEmitterService.off(EventNames.BASKET_CHANGED, callback);
  }

  private _setProducts(products: Product[]) {
    this._statefulEventEmitterService.emitCached(EventNames.BASKET_CHANGED, products);
  }
}
