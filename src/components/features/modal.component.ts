export class ModalComponent {
  private readonly _modalContainerElement: HTMLElement;
  private readonly _modalContentElement: HTMLElement;
  private readonly _modalCloseElement: HTMLElement;
  protected _openCallback = () => {};
  protected _closeCallback = () => {};
  private _isRender = false;
  private _isOpen = false;

  constructor() {
    this._modalContainerElement = document.querySelector('#modal-container');
    this._modalContentElement = this._modalContainerElement.querySelector('.modal__content');
    this._modalCloseElement = this._modalContainerElement.querySelector('.modal__close');
  }

  protected _renderModalContent(contentElement: HTMLElement): void {
    this._modalContentElement.textContent = '';
    this._initEventListeners();
    this._modalContentElement.appendChild(contentElement);
    this._isRender = true;
  }

  private _initEventListeners(): void {
    this._modalCloseElement.addEventListener('click', () => this._close());
  }

  protected _open(): void {
    if (this._isRender === false) {
      console.error(new Error('сначала должен быть вызван метод renderModalContent'));
      return;
    };
    if (this._isOpen === true) return;
    this._modalContainerElement.classList.add('modal_active');
    document.body.classList.add('page_overflow-hidden');
    window.addEventListener('keydown', this._closeByEsc);
    this._modalContainerElement.addEventListener('click', this._closeByOverlay);
    this._isOpen = true;
    if (typeof this._openCallback === 'function') {
      this._openCallback();
    }
  }

  protected _close(): void {
    if (this._isRender === false) {
      console.error(new Error('сначала должен быть вызван метод renderModalContent'));
      return;
    };
    if (this._isOpen === false) return;
    this._modalContainerElement.classList.remove('modal_active');
    document.body.classList.remove('page_overflow-hidden');
    window.removeEventListener('click', this._closeByEsc);
    this._modalContainerElement.removeEventListener('click', this._closeByOverlay);
    this._isOpen = false;
    if (typeof this._closeCallback === 'function') {
      this._closeCallback();
    }
  }

  private _closeByOverlay = (event: Event): void => {
    if (event.target === event.currentTarget) {
      this._close();
    }
  }

  private _closeByEsc = (event: KeyboardEvent): void => {
    event.preventDefault();
    if (event.key === 'Escape') {
      this._close();
    }
    
  }
}