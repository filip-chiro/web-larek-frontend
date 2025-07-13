import { EventEmitter, EventName } from "../components/base/events";

/**
 * Расширенный брокер, сохраняющий последние данные по событиям
 */
export class StatefulEventEmitterService extends EventEmitter {
  private _lastValues: Map<string, any> = new Map();

  override emit<T extends any>(eventName: string, data?: T): void {
    this._lastValues.set(eventName, data);
    super.emit(eventName, data);
  }

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

  /**
   * Снять все обработчики конкретного события
   */
  offAllByEventName(eventName: EventName): void {
    this._events.delete(eventName);

    if (typeof eventName === 'string') {
      this._lastValues.delete(eventName);
    }
  }

  /**
   * Получить последнее значение события
   */
  getLast<T = any>(eventName: string): T | undefined {
    return this._lastValues.get(eventName);
  }

  /**
   * Очистить сохраненные значения
   */
  clearLast(eventName?: string) {
    if (eventName) {
      this._lastValues.delete(eventName);
    } else {
      this._lastValues.clear();
    }
  }
}
