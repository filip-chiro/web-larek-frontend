export type RegisteredElement<T extends HTMLElement = HTMLElement> = T & { __registeredBrand: true };
