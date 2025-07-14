import { Order } from "../types";

/**
 * Сервис валидации данных заказа.
 * Позволяет проверить указанные поля объекта заказа и вернуть ошибки.
 */
export class ValidationOrderService {

  /**
   * Проверяет валидность указанных полей заказа.
   * Для каждого поля вызывает приватный метод проверки.
   * 
   * @param order Объект с данными заказа (частичный).
   * @param fields Массив ключей полей, которые нужно валидировать.
   * @returns Объект с результатом валидации:
   * - isValid — true, если ошибок нет.
   * - errors — объект с сообщениями ошибок по каждому полю.
   */
  validate(order: Partial<Order>, fields: (keyof Order)[]): {
    isValid: boolean;
    errors: Partial<Record<keyof Order, string>>;
  } {
    const errors: Partial<Record<keyof Order, string>> = {};

    for (const field of fields) {
      const error = this._validateField(field, order[field]);
      if (error) errors[field] = error;
    }

    const isValid = Object.keys(errors).length === 0;
    return { isValid, errors };
  }

  /**
   * Приватный метод проверки конкретного поля заказа.
   * Возвращает строку с ошибкой или null, если ошибок нет.
   * 
   * @param field Имя поля.
   * @param value Значение поля.
   * @returns Сообщение об ошибке или null.
   * @private
   */
  private _validateField(field: keyof Order, value: any): string | null {
    switch (field) {
      case 'email':
        if (!value) return 'Необходимо указать email';
        return null;

      case 'phone':
        if (!value) return 'Необходимо указать телефон';
        return null;

      case 'address':
        if (!value) return 'Необходимо указать адрес';
        return null;

      default:
        return null;
    }
  }
}