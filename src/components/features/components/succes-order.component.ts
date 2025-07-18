import { ModalService } from "../../../services/modal.service";
import { CreateOrderResponse } from "../../../types";
import { SuccessOrderData } from "../../../types/components/succes-order.component";
import { CachedComponent } from "./base/cached.component";

export class SuccessOrderComponent extends CachedComponent<SuccessOrderData> {
  constructor(
    private readonly _modalService: ModalService
  ) {
    const template = document.querySelector<HTMLTemplateElement>('#success'); // получение шаблона
    super(template); // получение узлов из дерева только при старте конструктора
  }

  /**
   * Инициализация кэшированных данных, вызывается при старте конструктора (происходит в CachedComponent)
   * Сохраняет результат вызова этой функции в this._cachedData
   */
  protected _initCachedData(): SuccessOrderData {
    return {
      successOrderElement: this._clonedTemplate,
      descriptionElement: this._clonedTemplate.querySelector('.order-success__description'),
      successBtnElement: this._clonedTemplate.querySelector('.order-success__close')
    }
  }
  
  /**
   * Вызывается один раз после старта конструктора и создания this._cachedData
   */
  protected _afterInit(): void {
    this._cachedData.successBtnElement.addEventListener('click', () => {
      this._modalService.close(this);
    });
  }

  /**
   * Вызывается каждый раз, когда вызывается публичный метод render
   */
  protected _update(res: CreateOrderResponse): void {
    this._cachedData.descriptionElement.textContent = `Списано ${res.total} синапсов`;
  }
}
