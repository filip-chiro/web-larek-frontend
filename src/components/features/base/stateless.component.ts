import { BaseComponent } from "./base.component";

/**
 * Не кэшируемый компонент — каждый вызов render возвращает новый элемент
 */
export abstract class StatelessComponent<TElement extends HTMLElement = HTMLElement> extends BaseComponent<TElement> {

}