import { cloneTemplate } from "../../../utils/utils";
import { DI_INIT } from "../di/di-symbols";
import { BaseComponent } from "./base.component";

/**
 * Кэшируемый компонент (рендерит только один раз, затем возвращает сохранённый элемент)
 */
export abstract class CachedComponent<T> extends BaseComponent {
  protected _cachedData: T;
  protected _cachedElement: HTMLElement;

  constructor(
    template: HTMLTemplateElement
  ) {
    super(template);

    this._cachedElement = this._cloneTemplate(template);
    this._cachedData = this._initCachedData();
    
    (this as any)[DI_INIT] = () => {
      this._afterInit();
    };
  }

  public render(...args: any[]): HTMLElement {
    this._update(...args);
    return this._cachedElement;
  }

  private _cloneTemplate(template: HTMLTemplateElement): HTMLElement {
    return cloneTemplate(template);
  }

  protected abstract _initCachedData(): T;

  protected _afterInit(): void {
    // Переопределяется при необходимости
  }

  protected _update(...args: any[]): void {
    // Переопределяется при необходимости
  }
}