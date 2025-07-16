import { Product } from "..";

export interface CardFullData {
  category: HTMLSpanElement;
  title: HTMLHeadingElement;
  img: HTMLImageElement;
  price: HTMLSpanElement;
  btn: HTMLButtonElement;
  product: Product
}