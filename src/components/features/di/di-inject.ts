import { DIConstructor } from "../../../types/di";
import { container } from "./di-container";

export function inject<T>(key: DIConstructor<T> | string): T {
  return container.resolve(key);
}
