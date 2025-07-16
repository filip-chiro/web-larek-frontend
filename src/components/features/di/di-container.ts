import { DIInitializable } from "../../../types";
import { DIConstructor, DIInjectable, DIProvider } from "../../../types/di";
import { DI_INIT } from "./di-symbols";

/**
 * Контейнер для управления зависимостями (DI) с поддержкой синглтонов и transient-сервисов.
 */
class DIContainer {
  /** Реестр зарегистрированных провайдеров */
  private _registry = new Map<string, DIProvider>();
  /** Хранилище синглтон-экземпляров */
  private _singletons = new Map<string, any>();

  /**
   * Регистрирует провайдера для класса.
   * @template T Тип создаваемого экземпляра.
   * @param key Конструктор класса, который регистрируется.
   * @param DIProvider Параметры провайдера (класс, зависимости, область).
   * @throws Ошибка, если количество зависимостей не совпадает с количеством параметров конструктора.
   */
  register<T>(key: DIConstructor<T>, DIProvider?: Partial<DIProvider<T>>): void {
    const name = key.name;

    const useClass = DIProvider?.useClass || key;
    const deps = DIProvider?.deps ?? (useClass as DIInjectable).inject ?? [];

    // Проверка соответствия количества параметров
    const expectedLength = useClass.length;
    if (expectedLength !== deps.length) {
      throw new Error(
        `Invalid registration for '${name}': DIConstructor expects ${expectedLength} dependencies, but got ${deps.length}`
      );
    }

    this._registry.set(name, {
      useClass,
      deps,
      scope: DIProvider?.scope ?? 'singleton',
    });
  }

  /**
   * Разрешает (создаёт) экземпляр зависимости по имени или конструктору.
   * Для синглтонов возвращает один и тот же экземпляр, для transient — новый.
   * @template T Тип создаваемого экземпляра.
   * @param key Имя класса или сам конструктор.
   * @returns Экземпляр запрошенной зависимости.
   * @throws Ошибка, если зависимость не зарегистрирована.
   */
  resolve<T>(key: string | DIConstructor<T>): T {
    const name = typeof key === 'string' ? key : key.name;

    const DIProvider = this._registry.get(name);
    if (!DIProvider) {
      throw new Error(`Dependency '${name}' is not registered.`);
    }

    if (DIProvider.scope !== 'transient' && this._singletons.has(name)) {
      return this._singletons.get(name);
    }

    const dependencies = (DIProvider.deps || []).map(dep => this.resolve(dep));
    const instance = new DIProvider.useClass(...dependencies);

    // только контейнер знает про этот Symbol
    if (typeof (instance as any)[DI_INIT] === 'function') {
      (instance as any)[DI_INIT]();
    }

    if (DIProvider.scope !== 'transient') {
      this._singletons.set(name, instance);
    }

    return instance;
  }
}

/** Глобальный контейнер зависимостей */
export const container = new DIContainer();
