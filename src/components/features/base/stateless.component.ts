import { BaseComponent } from "./base.component";

/**
 * Не кэшируемый компонент — каждый вызов render возвращает новый элемент
 */
export abstract class StatelessComponent extends BaseComponent {

}