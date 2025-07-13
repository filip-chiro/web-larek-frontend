import { EventNames, Product } from "../types";
import { StatefulEventEmitterService } from "./stateful-event-emitter.service";

export class BasketService {
  constructor(
    private readonly _statefulEventEmitterService: StatefulEventEmitterService
  ) {
    
  }

  getAll(): Product[] {
    const productsInBasket = this._statefulEventEmitterService.getLast(EventNames.BASKET);

    if (productsInBasket === undefined) {
      return [];
    }

    return productsInBasket;
  }

  getById(id: string): Product | undefined {
    const productsInBasket = this.getAll();

    const product = productsInBasket.find(product => product.id === id);
  
    return product;
  }

  getPriceBasket(): number {
    const productsInBasket = this.getAll();
    const price = productsInBasket.reduce((acc, product) => acc + (product.price || 0), 0);
    
    return price;
  }

  add(product: Product): void {
    const productsInBasket = this.getAll();

    if (productsInBasket.find((item) => item.id === product.id)) {
      return;
    }

    this._statefulEventEmitterService.emit(`add-card-to-basket-${product.id}`, product);
    this._statefulEventEmitterService.offAllByEventName(`remove-card-to-basket-${product.id}`);
    this._statefulEventEmitterService.emit(EventNames.BASKET, [...productsInBasket, product]);
  }

  remove(product: Product): void {
    const productsInBasket = this.getAll();
    const filteredProductsInBasket = productsInBasket.filter(item => item.id !== product.id);

    this._statefulEventEmitterService.offAllByEventName(`add-card-to-basket-${product.id}`);
    this._statefulEventEmitterService.emit(`remove-card-to-basket-${product.id}`, product);
    this._statefulEventEmitterService.emit(EventNames.BASKET, filteredProductsInBasket);
  }

  onBasket(callback: (products: Product[]) => void) {
    this._statefulEventEmitterService.on(EventNames.BASKET, callback);
  }

  offBasket(callback: (products: Product[]) => void): void {
    this._statefulEventEmitterService.off(EventNames.BASKET, callback);
  }

  onBasketById(id: string, callback: (product: Product) => void) {
    this._statefulEventEmitterService.on(`add-card-to-basket-${id}`, callback);
  }

  offBasketById(id: string): void {
    this._statefulEventEmitterService.offAllByEventName(`add-card-to-basket-${id}`);
  }

  
}