import { EventEmitter, EventName } from "../components/base/events";

/**
 * StatefulEventEmitterService — расширение EventEmitter,
 * которое сохраняет последнее значение каждого события.
 * При подписке сразу вызывает обработчик с последним сохранённым значением.
 */
export class StatefulEventEmitterService extends EventEmitter {
  private _lastValues: Map<string, any> = new Map();

  /**
   * Переопределение emit для сохранения последнего значения события.
   * @param eventName Имя события.
   * @param data Данные события.
   */
  override emit<T extends any>(eventName: string, data?: T): void {
    this._lastValues.set(eventName, data);
    super.emit(eventName, data);
  }

  /**
   * Переопределение on для вызова обработчика сразу с последним значением.
   * @param eventName Имя события.
   * @param callback Обработчик события.
   */
  override on<T extends any>(
    eventName: EventName,
    callback: (event: T) => void
  ): void {
    super.on(eventName, callback);

    if (typeof eventName === 'string' && this._lastValues.has(eventName)) {
      const lastValue = this._lastValues.get(eventName);
      callback(lastValue);
    }
  }

  waitFor<T = any>(
    eventName: string,
    onDestroy?: (unsubscribe: () => void) => void
  ): Promise<T> {
    return new Promise(resolve => {
      const cached = this._lastValues.get(eventName);
      if (cached !== undefined) {
        resolve(cached);
        return;
      }

      const handler = (data: T) => {
        this.off(eventName, handler);
        resolve(data);
      };

      this.on(eventName, handler);

      // Позволяет внешнему коду "зарегистрировать" отмену
      if (onDestroy) {
        onDestroy(() => this.off(eventName, handler));
      }
    });
  }

  /**
   * Удалить всех подписчиков указанного события и сбросить последнее значение.
   * @param eventName Имя события.
   */
  offAllByEventName(eventName: EventName): void {
    this._events.delete(eventName);

    if (typeof eventName === 'string') {
      this._lastValues.delete(eventName);
    }
  }

  /**
   * Получить последнее значение события.
   * @param eventName Имя события.
   * @returns Последние данные события, либо undefined.
   */
  getLast<T = any>(eventName: string): T | undefined {
    return this._lastValues.get(eventName);
  }

  /**
   * Очистить сохранённые значения события или всех событий.
   * @param eventName Имя события, если нужно очистить конкретное.
   */
  clearLast(eventName?: string) {
    if (eventName) {
      this._lastValues.delete(eventName);
    } else {
      this._lastValues.clear();
    }
  }
}
