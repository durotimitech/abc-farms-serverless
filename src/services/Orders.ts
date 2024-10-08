import { ICalculateOrderTotal } from "../types/orders";
import { DB_TABLE_NAMES } from "../utilities/constants";
import { docClient } from "../utilities/dbHelper";

type ICreateOrder = {
  productId: string;
  qty: number;
  price: number;
};

type Response = {
  success: boolean;
  data: { id: string };
  errMessage?: string;
};

class OrdersService {
  private static TABLE_NAME = DB_TABLE_NAMES.ORDERS as string;

  static async createOrder({ productId, qty, price }: ICreateOrder): Promise<Response> {
    let res: Response = {
      success: false,
      data: { id: "" },
      errMessage: "",
    };

    const id = Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    const orderTotal = qty * price;

    try {
      const params = {
        TableName: OrdersService.TABLE_NAME,
        Item: {
          id,
          productId,
          qty,
          orderTotal,
        },
        ConditionExpression: "attribute_not_exists(id)",
      };
      await docClient.put(params).promise();

      res.success = true;
      res.data.id = id;

      return res;
    } catch (e: any) {
      res.errMessage = e.message;
      return res;
    }
  }
}

export default OrdersService;
