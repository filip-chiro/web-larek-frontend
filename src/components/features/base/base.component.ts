/**
 * Базовый абстрактный компонент
 */
export abstract class BaseComponent {
  protected readonly _template: HTMLTemplateElement;

  constructor(
    template: HTMLTemplateElement
  ) {
    this._template = template;
  }

  public abstract render(...args: any[]): HTMLElement;
}
