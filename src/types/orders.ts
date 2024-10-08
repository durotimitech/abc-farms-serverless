export type ICreateOrder = {
  productId: string;
  qty: number;
};

export interface ICalculateOrderTotal {
  qty: number;
  price: number;
}
