import { BaseComponent } from "../../../components/features/components/base/base.component";


export type RegisteredElement<T extends HTMLElement = HTMLElement> = T & { __registeredBrand: true };

export interface ComponentRegistryInfo {
  instance: BaseComponent;
  element: HTMLElement;
  id: string;
}
