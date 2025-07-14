import { GetAllProductsResponse, Product } from "../types";
import { ApiService } from "./api.service";

/**
 * Сервис для работы с продуктами через API.
 * Расширяет базовый ApiService, реализует методы получения списка продуктов и продукта по ID.
 */
export class ApiProductsService extends ApiService {
  constructor() {
    super();
  }
  
  /**
   * Получить список всех продуктов.
   * Выполняет GET-запрос по эндпоинту '/product' и возвращает массив продуктов.
   * 
   * @returns Промис, который разрешается массивом продуктов.
   */
  getAll(): Promise<Product[]> {
    return this.get<GetAllProductsResponse>('/product').then(productsResponse => productsResponse.items);
  }

  /**
   * Получить продукт по его ID.
   * Выполняет GET-запрос по эндпоинту '/product/{id}'.
   * 
   * @param id Идентификатор продукта.
   * @returns Промис, который разрешается объектом продукта.
   */
  getById(id: string): Promise<Product> {
    return this.get<Product>(`/product/${id}`);
  }
}