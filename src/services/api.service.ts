import { Api } from "../components/base/api";
import { API_URL } from "../utils/constants";

export class ApiService extends Api {
  constructor() {
    super(API_URL);
  }
}