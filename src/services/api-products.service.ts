import { GetAllProductsResponse, Product } from "../types";
import { ApiService } from "./api.service";

export class ApiProductsService extends ApiService {
  constructor() {
    super();
  }
  
  getAll(): Promise<Product[]> {
    return this.get<GetAllProductsResponse>('/product').then(productsResponse => productsResponse.items);
  }

  getById(id: string): Promise<Product> {
    return this.get<Product>(`/product/${id}`);
  }
}