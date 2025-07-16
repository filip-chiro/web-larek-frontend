/**
 * Компонент модального окна, отвечающий за отображение, открытие и закрытие модалки.
 * 
 * Основные задачи:
 * - Вставка переданного контента в модальное окно.
 * - Управление видимостью модального окна и блокировка скролла страницы при открытии.
 * - Обработка событий закрытия: клик по крестику, клик вне содержимого (оверлей) и клавиша Escape.
 * - Подписка и отписка от событий при открытии и закрытии модального окна.
 */
export class ModalComponent {
  private readonly _modalContainerElement: HTMLElement;
  private readonly _modalContentElement: HTMLElement;
  private readonly _modalCloseElement: HTMLElement;
  private _openCallback: () => void = () => {};
  private _closeCallback: () => void = () => {};
  private _closeOnceCallback: () => void = () => {};
  private _isOpen = false;
  private _pointerDownInsideModal = false;
  private _pointerUpInsideModal = false;
  private _isProgrammaticClose = false;

  constructor() {
    this._modalContainerElement = document.querySelector('#modal-container');
    this._modalContentElement = this._modalContainerElement.querySelector('.modal__content');
    this._modalCloseElement = this._modalContainerElement.querySelector('.modal__close');
  }

  /**
   * Открывает модальное окно с указанным содержимым.
   * Если модалка уже открыта, просто обновляет контент.
   */
  open(
    content: HTMLElement,
    options?: { onOpen?: () => void; onClose?: () => void; onCloseOnce?: () => void }
  ): void {
    const isAlreadyOpen = this._isOpen;

    this._modalContentElement.textContent = '';
    this._modalContentElement.appendChild(content);

    this._openCallback = options?.onOpen ?? (() => {});
    this._closeCallback = options?.onClose ?? (() => {});
    this._closeOnceCallback = options?.onCloseOnce ?? (() => {});

    if (!isAlreadyOpen) {
      this._initEventListeners();
      this._modalContainerElement.classList.add('modal_active');
      document.body.classList.add('page_overflow-hidden');
      this._isOpen = true;
      this._openCallback();
    }
  }

  /**
   * Программное закрытие модалки (по команде сервиса).
   */
  close = (): void => {
    if (!this._isOpen) return;

    this._isProgrammaticClose = true;

    this._modalContainerElement.classList.remove('modal_active');
    document.body.classList.remove('page_overflow-hidden');
    this._isOpen = false;

    this._destroyEventListeners();

    this._closeCallback();

    // `onCloseOnce` вызывается только при ручном закрытии
    // (т.е. здесь — не вызывается)
    this._isProgrammaticClose = false;
  }

  /**
   * Ручное закрытие (крестик, оверлей, Esc).
   */
  private _manualClose = (): void => {
    if (!this._isOpen) return;

    this._modalContainerElement.classList.remove('modal_active');
    document.body.classList.remove('page_overflow-hidden');
    this._isOpen = false;

    this._destroyEventListeners();

    this._closeCallback();
    if (!this._isProgrammaticClose) {
      this._closeOnceCallback();
    }
  }

  private _initEventListeners(): void {
    this._modalCloseElement.addEventListener('click', this._manualClose);
    this._modalContainerElement.addEventListener('pointerdown', this._onPointerDown);
    this._modalContainerElement.addEventListener('pointerup', this._onPointerUp);
    this._modalContainerElement.addEventListener('click', this._closeByOverlay);
    window.addEventListener('keydown', this._closeByEsc);
  }

  private _destroyEventListeners(): void {
    this._modalCloseElement.removeEventListener('click', this._manualClose);
    this._modalContainerElement.removeEventListener('pointerdown', this._onPointerDown);
    this._modalContainerElement.removeEventListener('pointerup', this._onPointerUp);
    this._modalContainerElement.removeEventListener('click', this._closeByOverlay);
    window.removeEventListener('keydown', this._closeByEsc);
  }

  private _onPointerDown = (event: PointerEvent): void => {
    this._pointerDownInsideModal = this._modalContentElement.contains(event.target as Node);
  }

  private _onPointerUp = (event: PointerEvent): void => {
    this._pointerUpInsideModal = this._modalContentElement.contains(event.target as Node);
  }

  private _closeByOverlay = (event: MouseEvent): void => {
    if (event.target === this._modalContainerElement &&
        !this._pointerDownInsideModal &&
        !this._pointerUpInsideModal) {
      this._manualClose();
    }
  }

  private _closeByEsc = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      this._manualClose();
    }
  }
}