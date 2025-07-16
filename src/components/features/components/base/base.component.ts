import { ComponentRegistryService } from "../../../../services/component-registry.service";
import { RegisteredElement } from "../../../../types/components/base/component";
import { cloneTemplate } from "../../../../utils/utils";
import { inject } from "../../di/di-inject";

/**
 * Базовый абстрактный компонент
 */
export abstract class BaseComponent<TElement extends HTMLElement = HTMLElement> {
  protected readonly _template: HTMLTemplateElement;
  private _componentRegistryService: ComponentRegistryService;

  constructor(template: HTMLTemplateElement) {
    this._template = template;
    this._componentRegistryService = inject(ComponentRegistryService);
  }

  public abstract render(...args: any[]): RegisteredElement<TElement>;

  protected _cloneTemplate(): RegisteredElement<TElement> {
    const element = cloneTemplate<TElement>(this._template);
    return this._registerElement(element);
  }

  protected _registerElement(element: TElement): RegisteredElement<TElement> {
    this._componentRegistryService.register(this, element);
    return element as RegisteredElement<TElement>;
  }
}