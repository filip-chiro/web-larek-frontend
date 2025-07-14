import { ModalComponent } from "../components/features/modal.component";
import { Component } from "../types";

/**
 * Сервис для управления модальными окнами в приложении.
 * Отвечает за открытие, закрытие модалок и обработку событий закрытия.
 * 
 * Использует переданный экземпляр ModalComponent для отображения и скрытия модального окна.
 * Позволяет рендерить в модалку любой компонент или DOM-элемент.
 * Снижает дублирование кода и обеспечивает единое место управления поведением модалок.
 */
export class ModalService {
  private _currentModal: {
    element: HTMLElement;
    component?: Component;
    onClose?: () => void;
  } | null = null;

  private _onCloseListeners = new Map<HTMLElement, Set<() => void>>();

  constructor(private readonly _modalComponent: ModalComponent) {}

  /**
   * Открывает модальное окно с указанным содержимым.
   * @param content - компонент с методом render() или уже готовый HTMLElement для отображения.
   * @param renderArgs - опциональные аргументы для метода render компонента.
   * @param options - дополнительные опции с коллбеками onOpen и onClose.
   */
  open(
    content: Component | HTMLElement,
    renderArgs?: any[] | any,
    options?: { onOpen?: () => void; onClose?: () => void }
  ): void {
    const element = this._resolveElement(content, renderArgs);

    // 👇 Присваиваем обратно в компонент — чтобы потом onClose знал что делать
    if (this._isComponent(content)) {
      (content as any).__modalElement = element;
    }

    if (this._currentModal?.element === element) return;

    const modal = {
      element,
      component: this._isComponent(content) ? (content as Component) : undefined,
      onClose: options?.onClose,
    };

    this._currentModal = modal;

    this._modalComponent.open(element, {
      onOpen: options?.onOpen,
      onClose: () => {
        this._invokeCloseCallbacks(element);
        this._handleModalClose(modal);
        if (this._currentModal?.element === element) {
          this._currentModal = null;
        }
      }
    });
  }

  /**
   * Закрывает модальное окно, связанное с указанным компонентом или элементом.
   * Если модалка с этим элементом не открыта, метод не выполняет действий.
   * @param content - компонент или DOM-элемент модалки, которую нужно закрыть.
   */
  close(content: Component | HTMLElement): void {
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

    if (this._currentModal.element !== elementToClose) return;

    this._modalComponent.close();
  }

  /**
   * Регистрирует callback, который будет вызван при закрытии модального окна,
   * связанного с указанным компонентом или элементом.
   * @param target - компонент или элемент, на закрытие которого нужно подписаться.
   * @param callback - функция, вызываемая при закрытии модалки.
   */
  onClose(target: Component | HTMLElement, callback: () => void): void {
    setTimeout(() => this._onClose(target, callback), 0);
  }

  private _onClose(target: Component | HTMLElement, callback: () => void): void {
    let element: HTMLElement;

    // Если это компонент и он уже был открыт
    if (this._isComponent(target)) {
      const maybeRendered = (target as any).__modalElement;
      if (!maybeRendered) {
        console.warn('[ModalService] Cannot register onClose: component was not rendered via open()');
        return;
      }
      element = maybeRendered;
    } else {
      element = target;
    }

    if (!this._onCloseListeners.has(element)) {
      this._onCloseListeners.set(element, new Set());
    }

    this._onCloseListeners.get(element)!.add(callback);
  }

  private _invokeCloseCallbacks(element: HTMLElement): void {
    const callbacks = this._onCloseListeners.get(element);
    if (!callbacks) return;

    for (const cb of callbacks) {
      try {
        cb();
      } catch (err) {
        console.error('ModalService onClose error:', err);
      }
    }

    this._onCloseListeners.delete(element);
  }

  private _handleModalClose(modal: {
    element: HTMLElement;
    component?: Component;
    onClose?: () => void;
  }): void {
    modal.component?.onClose?.();
    modal.onClose?.();
  }

  private _resolveElement(content: Component | HTMLElement, renderArgs?: any[] | any): HTMLElement {
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

  private _isComponent(obj: any): obj is Component {
    return typeof obj === 'object' && typeof obj.render === 'function';
  }
}
