import { Api } from "../components/base/api";
import { API_URL } from "../utils/constants";

/**
 * Класс ApiService — конкретная реализация Api с фиксированным базовым URL.
 * Используется для взаимодействия с серверным API приложения.
 */
export class ApiService extends Api {
  constructor() {
    super(API_URL);
  }
}