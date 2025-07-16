import { BaseComponent } from "../components/features/base/base.component";
import { ModalComponent } from "../components/features/modal.component";

export class ModalService {
  private _currentModal: {
    element: HTMLElement;
    component?: BaseComponent;
    onClose?: () => void;
  } | null = null;

  private _onCloseListeners = new Map<HTMLElement, Set<() => void>>();
  private _onCloseOnceListeners = new Map<HTMLElement, Set<() => void>>();

  private _pendingCloseListeners = new WeakMap<BaseComponent | HTMLElement, Set<() => void>>();
  private _pendingCloseOnceListeners = new WeakMap<BaseComponent | HTMLElement, Set<() => void>>();

  constructor(private readonly _modalComponent: ModalComponent) {}

  open(
    content: BaseComponent | HTMLElement,
    renderArgs?: any[] | any,
    options?: { onOpen?: () => void; onClose?: () => void }
  ): void {
    const element = this._resolveElement(content, renderArgs);

    if (this._currentModal) {
      this._handleModalClose(this._currentModal);
      this._invokeAllCloseCallbacks(this._currentModal.element);
    }

    this._currentModal = {
      element,
      component: this._isComponent(content) ? content : undefined,
      onClose: options?.onClose
    };

    this._modalComponent.open(element, {
      onOpen: options?.onOpen,
      onClose: () => {
        this._handleModalClose(this._currentModal!);
        this._invokeAllCloseCallbacks(element);
        this._currentModal = null;
      }
    });

    this._flushPendingListeners(content, element);
  }

  close(content: BaseComponent | HTMLElement): void {
    const element = this._resolveElement(content);
    if (!this._currentModal || this._currentModal.element !== element) return;

    this._modalComponent.close(); // вызовет onClose из open
  }

  onClose(target: BaseComponent | HTMLElement, callback: () => void): void {
    setTimeout(() => this._onClose(target, callback), 0);
  }

  private _onClose(content: BaseComponent | HTMLElement, callback: () => void): void {
    const element = this._getElementIfOpen(content);
    if (element) {
      if (!this._onCloseListeners.has(element)) {
        this._onCloseListeners.set(element, new Set());
      }
      this._onCloseListeners.get(element)!.add(callback);
    } else {
      this._addPendingListener(this._pendingCloseListeners, content, callback);
    }
  }

  onCloseOnce(content: BaseComponent | HTMLElement, callback: () => void): void {
    setTimeout(() => this._onCloseOnce(content, callback), 0);
  }

  private _onCloseOnce(content: BaseComponent | HTMLElement, callback: () => void): void {
    const element = this._getElementIfOpen(content);
    if (element) {
      if (!this._onCloseOnceListeners.has(element)) {
        this._onCloseOnceListeners.set(element, new Set());
      }
      this._onCloseOnceListeners.get(element)!.add(callback);
    } else {
      this._addPendingListener(this._pendingCloseOnceListeners, content, callback);
    }
  }

  private _invokeAllCloseCallbacks(element: HTMLElement): void {
    const once = this._onCloseOnceListeners.get(element);
    const regular = this._onCloseListeners.get(element);

    once?.forEach(cb => cb());
    this._onCloseOnceListeners.delete(element);

    regular?.forEach(cb => cb());
  }

  private _handleModalClose(modal: {
    element: HTMLElement;
    component?: BaseComponent;
    onClose?: () => void;
  }): void {
    modal.onClose?.();
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

  private _flushPendingListeners(
    source: BaseComponent | HTMLElement,
    resolvedElement: HTMLElement
  ): void {
    const copyAndClear = (map: WeakMap<any, Set<() => void>>): Set<() => void> => {
      const listeners = map.get(source);
      if (!listeners) return new Set();
      map.delete(source);
      return listeners;
    };

    const once = copyAndClear(this._pendingCloseOnceListeners);
    const regular = copyAndClear(this._pendingCloseListeners);

    if (once.size > 0) {
      this._onCloseOnceListeners.set(resolvedElement, new Set(once));
    }
    if (regular.size > 0) {
      this._onCloseListeners.set(resolvedElement, new Set(regular));
    }
  }
}