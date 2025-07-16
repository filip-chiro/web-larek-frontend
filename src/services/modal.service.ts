import { BaseComponent } from "../components/features/base/base.component";
import { ModalComponent } from "../components/features/modal.component";
import { ComponentRegistryService } from "./component-registry.service";

export class ModalService {
  private _currentModal: {
    element: HTMLElement;
    component?: BaseComponent;
    onClose?: () => void;
  } | null = null;

  private _onCloseListeners = new Map<HTMLElement, Set<() => void>>();
  private _pendingCloseListeners = new WeakMap<BaseComponent | HTMLElement, Set<() => void>>();
  private _pendingCloseOnceListeners = new WeakMap<BaseComponent | HTMLElement, Set<() => void>>();

  constructor(
    private readonly _modalComponent: ModalComponent,
    private readonly _componentRegistryService: ComponentRegistryService
  ) {}

  open(
    content: BaseComponent | HTMLElement,
    renderArgs?: any[] | any,
    options?: { onOpen?: () => void; onClose?: () => void }
  ): void {
    const element = this._resolveElement(content, renderArgs);

    // Закрываем текущую модалку
    if (this._currentModal) {
      this._handleModalClose(this._currentModal);
      this._invokeRegularCloseCallbacks(this._currentModal.element);
    }

    const onceListeners = this._collectPendingOnceListeners(content);
    const regularListeners = this._collectPendingRegularListeners(content);

    let component = this._isComponent(content)
      ? content
      : this._componentRegistryService.getByElement(content)?.instance;

    this._currentModal = {
      element,
      component,
      onClose: options?.onClose,
    };

    this._modalComponent.open(element, {
      onOpen: options?.onOpen,
      onClose: () => {
        // Всегда вызывается при любом закрытии
        this._handleModalClose(this._currentModal);
        this._invokeRegularCloseCallbacks(element);
      },
      onCloseOnce: () => {
        // Только ручное закрытие — сбрасываем состояние
        onceListeners.forEach((cb) => cb());
        this._currentModal = null;
      },
    });

    if (regularListeners.length > 0) {
      if (!this._onCloseListeners.has(element)) {
        this._onCloseListeners.set(element, new Set());
      }
      const set = this._onCloseListeners.get(element)!;
      regularListeners.forEach((cb) => set.add(cb));
    }
  }

  close(content: BaseComponent | HTMLElement): void {
    if (!this._currentModal) return;

    const isSame =
      this._isComponent(content)
        ? this._currentModal.component === content
        : this._currentModal.element === content;

    if (!isSame) return;

    // Программное закрытие — не вызывает onCloseOnce
    this._modalComponent.close();

    this._handleModalClose(this._currentModal);
    this._invokeRegularCloseCallbacks(this._currentModal.element);

    // Не обнуляем _currentModal — onCloseOnce этого не требует
  }

  onClose(target: BaseComponent | HTMLElement, callback: () => void): void {
    setTimeout(() => {
      const element = this._getElementIfOpen(target);
      if (element) {
        if (!this._onCloseListeners.has(element)) {
          this._onCloseListeners.set(element, new Set());
        }
        this._onCloseListeners.get(element)!.add(callback);
      } else {
        this._addPendingListener(this._pendingCloseListeners, target, callback);
      }
    }, 0);
  }

  onCloseOnce(target: BaseComponent | HTMLElement, callback: () => void): void {
    setTimeout(() => {
      this._addPendingListener(this._pendingCloseOnceListeners, target, callback);
    }, 0);
  }

  private _invokeRegularCloseCallbacks(element: HTMLElement): void {
    const regular = this._onCloseListeners.get(element);
    regular?.forEach((cb) => cb());
  }

  private _handleModalClose(modal: {
    element: HTMLElement;
    component?: BaseComponent;
    onClose?: () => void;
  }): void {
    modal?.onClose?.();
  }

  private _resolveElement(content: BaseComponent | HTMLElement, renderArgs?: any[] | any): HTMLElement {
    if (this._isComponent(content)) {
      const args = Array.isArray(renderArgs) ? renderArgs : [renderArgs];
      return content.render(...args);
    }
    return content;
  }

  private _isComponent(obj: any): obj is BaseComponent {
    return typeof obj?.render === 'function';
  }

  private _getElementIfOpen(content: BaseComponent | HTMLElement): HTMLElement | null {
    if (!this._currentModal) return null;

    if (this._isComponent(content)) {
      return this._currentModal.component === content ? this._currentModal.element : null;
    }

    return this._currentModal.element === content ? content : null;
  }

  private _addPendingListener(
    storage: WeakMap<BaseComponent | HTMLElement, Set<() => void>>,
    target: BaseComponent | HTMLElement,
    callback: () => void
  ): void {
    if (!storage.has(target)) {
      storage.set(target, new Set());
    }
    storage.get(target)!.add(callback);
  }

  private _collectPendingRegularListeners(target: BaseComponent | HTMLElement): (() => void)[] {
    const listeners = this._pendingCloseListeners.get(target);
    if (!listeners) return [];
    this._pendingCloseListeners.delete(target);
    return Array.from(listeners);
  }

  private _collectPendingOnceListeners(target: BaseComponent | HTMLElement): (() => void)[] {
    const listeners = this._pendingCloseOnceListeners.get(target);
    if (!listeners) return [];
    this._pendingCloseOnceListeners.delete(target);
    return Array.from(listeners);
  }
}