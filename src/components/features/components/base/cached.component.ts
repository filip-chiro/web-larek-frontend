import { RegisteredElement } from "../../../../types/components/base/component";
import { DI_INIT } from "../../di/di-symbols";
import { BaseComponent } from "./base.component";

/**
 * Кэшируемый компонент (рендерит только один раз, затем возвращает сохранённый элемент)
 */
export abstract class CachedComponent<
  TCache = unknown,
  TElement extends HTMLElement = HTMLElement
> extends BaseComponent<TElement> {
  protected _cachedData: TCache;
  protected _cachedElement: RegisteredElement<TElement>;
  private _isRegistered: boolean;

  constructor(template: HTMLTemplateElement) {
    super(template);
    this._cachedElement = this._cloneTemplate();
    this._cachedData = this._initCachedData();
    this._isRegistered = false;

    (this as any)[DI_INIT] = () => {
      this._afterInit();
    };
  }

  public render(...args: any[]): RegisteredElement<TElement> {
    this._update(...args);
    if (!this._isRegistered) {
      this._cachedElement = this._registerElement(this._cachedElement);
      this._isRegistered = true;
    }
    return this._cachedElement;
  }

  protected abstract _initCachedData(): TCache;

  protected _afterInit(): void {
    // Переопределяется при необходимости
  }

  protected _update(...args: any[]): void {
    // Переопределяется при необходимости
  }
}
