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
  private _isOpen = false;

  private _pointerDownInsideModal = false;
  private _pointerUpInsideModal = false;

  constructor() {
    this._modalContainerElement = document.querySelector('#modal-container')!;
    this._modalContentElement = this._modalContainerElement.querySelector('.modal__content')!;
    this._modalCloseElement = this._modalContainerElement.querySelector('.modal__close')!;
  }

  /**
   * Открывает модальное окно с указанным содержимым.
   * Если модалка уже открыта, просто обновляет контент.
   * 
   * @param content - DOM элемент, который будет вставлен в тело модального окна.
   * @param options - Опциональные колбэки для событий открытия и закрытия.
   */
  open(content: HTMLElement, options?: { onOpen?: () => void; onClose?: () => void }): void {
    const isAlreadyOpen = this._isOpen;

    this._modalContentElement.textContent = '';
    this._modalContentElement.appendChild(content);

    this._openCallback = options?.onOpen ?? (() => {});
    this._closeCallback = options?.onClose ?? (() => {});

    if (!isAlreadyOpen) {
      this._initEventListeners();
      this._modalContainerElement.classList.add('modal_active');
      document.body.classList.add('page_overflow-hidden');
      this._isOpen = true;
      this._openCallback();
    }
  }

  /**
   * Закрывает модальное окно, снимает блокировку скролла и вызывает колбэк onClose.
   */
  close = (): void => {
    if (!this._isOpen) return;

    this._modalContainerElement.classList.remove('modal_active');
    document.body.classList.remove('page_overflow-hidden');
    this._isOpen = false;

    this._destroyEventListeners();
    this._closeCallback();
  }

  /**
   * Инициализирует обработчики событий для управления закрытием модального окна:
   * клики по крестику, оверлею, а также клавиша Escape.
   * @private
   */
  private _initEventListeners(): void {
    this._modalCloseElement.addEventListener('click', this.close);
    this._modalContainerElement.addEventListener('pointerdown', this._onPointerDown);
    this._modalContainerElement.addEventListener('pointerup', this._onPointerUp);
    this._modalContainerElement.addEventListener('click', this._closeByOverlay);
    window.addEventListener('keydown', this._closeByEsc);
  }

  /**
   * Удаляет ранее добавленные обработчики событий.
   * @private
   */
  private _destroyEventListeners(): void {
    this._modalCloseElement.removeEventListener('click', this.close);
    this._modalContainerElement.removeEventListener('pointerdown', this._onPointerDown);
    this._modalContainerElement.removeEventListener('pointerup', this._onPointerUp);
    this._modalContainerElement.removeEventListener('click', this._closeByOverlay);
    window.removeEventListener('keydown', this._closeByEsc);
  }

  /**
   * Обработчик события pointerdown внутри модального окна,
   * отслеживает попадание клика внутрь контента модалки.
   * @param event - событие указателя
   * @private
   */
  private _onPointerDown = (event: PointerEvent): void => {
    this._pointerDownInsideModal = this._modalContentElement.contains(event.target as Node);
  }

  /**
   * Обработчик события pointerup внутри модального окна,
   * отслеживает отпускание клика внутри модалки.
   * @param event - событие указателя
   * @private
   */
  private _onPointerUp = (event: PointerEvent): void => {
    this._pointerUpInsideModal = this._modalContentElement.contains(event.target as Node);
  }

  /**
   * Обработчик клика по оверлею (фону модального окна).
   * Закрывает модалку, если клик был именно по оверлею
   * и pointerdown и pointerup не были внутри контента.
   * @param event - событие мыши
   * @private
   */
  private _closeByOverlay = (event: MouseEvent): void => {
    // Клик по оверлею
    if (event.target === this._modalContainerElement) {
      // Закрываем только если pointerdown и pointerup были вне модалки
      if (!this._pointerDownInsideModal && !this._pointerUpInsideModal) {
        this.close();
      }
    }
  }

  /**
   * Обработчик события нажатия клавиши Escape для закрытия модального окна.
   * @param event - событие клавиатуры
   * @private
   */
  private _closeByEsc = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      this.close();
    }
  }
}
