import { BaseComponent } from "../components/features/base/base.component";
import { ModalComponent } from "../components/features/modal.component";

/**
 * Сервис для управления модальными окнами.
 * 
 * Отвечает за открытие и закрытие модалок, подписку на события закрытия,
 * а также за реактивное поведение — позволяет отслеживать как обычные события закрытия,
 * так и закрытие компонента только в случае, если он был перезаписан (onCloseOnce).
 * 
 * Обеспечивает единый способ управления модальными окнами, изолируя логику отображения от логики управления.
 */
export class ModalLastService {
  private _currentModal: {
    element: HTMLElement;
    component?: BaseComponent;
    onClose?: () => void;
  } | null = null;

  private _onCloseListeners = new Map<HTMLElement, Set<() => void>>();
  private _onCloseOnceListeners = new Map<HTMLElement, Set<() => void>>();

  constructor(
    private readonly _modalComponent: ModalComponent
  ) {}

  open(
    content: BaseComponent | HTMLElement,
    renderArgs?: any[] | any,
    options?: { onOpen?: () => void; onClose?: () => void }
  ): void {
    console.log('open', this);
    
    const element = this._resolveElement(content, renderArgs);

    console.log(this._isComponent(content));
    

    if (this._isComponent(content)) {
      (content as any).__modalElement = element;
    }

    if (this._currentModal && this._currentModal.element !== element) {
      this._modalComponent.close();
      this._currentModal = null;
    }

    if (this._currentModal?.element === element) return;

    const modal = {
      element,
      component: this._isComponent(content) ? (content as BaseComponent) : undefined,
      onClose: options?.onClose,
    };

    this._currentModal = modal;

    this._modalComponent.open(element, {
      onOpen: options?.onOpen,
      onClose: () => {
        this._invokeAllCloseCallbacks(element);
        this._handleModalClose(modal);
        if (this._currentModal?.element === element) {
          this._currentModal = null;
        }
      }
    });
  }

  close(content: BaseComponent | HTMLElement): void {
    console.log('close', this);
    
    if (!this._currentModal) return;

    let elementToClose: HTMLElement;

    if (this._isComponent(content)) {
      const maybeRendered = (content as any).__modalElement;
      if (!maybeRendered) {
        console.warn('[ModalService] Cannot close modal: component was not opened via ModalService');
        return;
      }
      elementToClose = maybeRendered;
    } else {
      elementToClose = content;
    }

    if (this._currentModal.element !== elementToClose) {
      console.warn('[ModalService] Tried to close modal with element that is not currently open.');
      return;
    }

    this._modalComponent.close();
  }

  onClose(target: BaseComponent | HTMLElement, callback: () => void): void {
    setTimeout(() => this._onClose(target, callback), 0);
  }

  private _onClose(content: BaseComponent | HTMLElement, callback: () => void): void {
    let element: HTMLElement;

    console.log('onClose', this);
    

    if (this._isComponent(content)) {
      const maybeRendered = (content as any).__modalElement;
      if (!maybeRendered) {
        console.warn('[ModalService] Cannot register onClose: component was not rendered via open()');
        return;
      }
      element = maybeRendered;
    } else {
      element = content;
    }

    if (!this._onCloseListeners.has(element)) {
      this._onCloseListeners.set(element, new Set());
    }

    this._onCloseListeners.get(element)!.add(callback);
  }

  onCloseOnce(target: BaseComponent | HTMLElement, callback: () => void): void {
    setTimeout(() => this._onCloseOnce(target, callback), 0);
  }

  private _onCloseOnce(content: BaseComponent | HTMLElement, callback: () => void): void {
    let element: HTMLElement;

    if (this._isComponent(content)) {
      const maybeRendered = (content as any).__modalElement;
      if (!maybeRendered) {
        console.warn('[ModalService] Cannot register onCloseOnce: component was not rendered via open()');
        return;
      }
      element = maybeRendered;
    } else {
      element = content;
    }

    if (!this._onCloseOnceListeners.has(element)) {
      this._onCloseOnceListeners.set(element, new Set());
    }

    this._onCloseOnceListeners.get(element)!.add(callback);
  }

  private _invokeAllCloseCallbacks(element: HTMLElement): void {
    const callbacks = this._onCloseListeners.get(element);
    if (callbacks) {
      for (const cb of callbacks) {
        try {
          cb();
        } catch (err) {
          console.error('ModalService onClose error:', err);
        }
      }
      this._onCloseListeners.delete(element);
    }

    if (!this._currentModal || this._currentModal.element !== element) {
      const onceCallbacks = this._onCloseOnceListeners.get(element);
      if (onceCallbacks) {
        for (const cb of onceCallbacks) {
          try {
            cb();
          } catch (err) {
            console.error('ModalService onCloseOnce error:', err);
          }
        }
        this._onCloseOnceListeners.delete(element);
      }
    }
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
      if (Array.isArray(renderArgs)) {
        return content.render(...renderArgs);
      } else if (renderArgs !== undefined) {
        return content.render(renderArgs);
      } else {
        return content.render();
      }
    } else {
      return content as HTMLElement;
    }
  }

  private _isComponent(obj: any): obj is BaseComponent {
    return typeof obj === 'object' && typeof obj.render === 'function';
  }
}