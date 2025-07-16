import { ModalService } from "../../../services/modal.service";
import { CreateOrderResponse } from "../../../types";
import { SuccessOrderData } from "../../../types/components/succes-order.component";
import { CachedComponent } from "./base/cached.component";

export class SuccessOrderComponent extends CachedComponent<SuccessOrderData> {
  constructor(
    private readonly _modalService: ModalService
  ) {
    super(document.querySelector('#success'));
  }

  protected _initCachedData(): SuccessOrderData {
    return {
      successOrderElement: this._cachedElement,
      descriptionElement: this._cachedElement.querySelector('.order-success__description'),
      successBtnElement: this._cachedElement.querySelector('.order-success__close')
    }
  }

  protected _afterInit(): void {
    const {
      successBtnElement
    } = this._cachedData;

    successBtnElement.addEventListener('click', () => {
      this._modalService.close(this);
    });
  }

  protected _update(res: CreateOrderResponse): void {
    const { descriptionElement } = this._cachedData;

    descriptionElement.textContent = `Списано ${res.total} синапсов`;
  }
}
