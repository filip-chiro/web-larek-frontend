import { BaseComponent } from "../components/features/components/base/base.component";
import { ComponentRegistryInfo } from "../types/components/base/component";
import { hashCode } from "../utils/utils";

export class ComponentRegistryService {
  private _byInstance = new WeakMap<BaseComponent, ComponentRegistryInfo>();
  private _byElement = new WeakMap<HTMLElement, ComponentRegistryInfo>();
  private _listeners = new Map<string, Set<() => void>>();

  register(instance: BaseComponent, element: HTMLElement): void {
    const id = this._generateId(instance);
    const info: ComponentRegistryInfo = { instance, element, id };
    this._byInstance.set(instance, info);
    this._byElement.set(element, info);
    element.dataset.componentId = id;

    const listeners = this._listeners.get(id);
    if (listeners) {
      listeners.forEach(cb => cb());
      this._listeners.delete(id);
    }
  }

  getByInstance(instance: BaseComponent): ComponentRegistryInfo | undefined {
    return this._byInstance.get(instance);
  }

  getByElement(element: HTMLElement): ComponentRegistryInfo | undefined {
    return this._byElement.get(element);
  }

  onRegisteredByInstance(instance: BaseComponent, callback: () => void): void {
    const info = this.getByInstance(instance);
    if (info) return callback();
    const id = this._generateId(instance);
    if (!this._listeners.has(id)) this._listeners.set(id, new Set());
    this._listeners.get(id)!.add(callback);
  }

  private _generateId(instance: BaseComponent): string {
    return (instance.constructor.name || 'Component') + '_' + hashCode(instance);
  }
}
