import { ICalculateOrderTotal } from "../types/orders";

class OrdersService {
  // private static TABLE_NAME = DB_TABLE_NAMES.PRODUCTS as string;

  static async calculateOrderTotal({ qty, price }: ICalculateOrderTotal): Promise<number> {
    const total = qty * price;
    return total;
  }
}

export default OrdersService;
