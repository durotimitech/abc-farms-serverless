import { IProduct } from "../types/products";
import { DB_TABLE_NAMES } from "../utilities/constants";
import { docClient } from "../utilities/dbHelper";

type Response = {
  success: boolean;
  data: IProduct;
  errMessage?: string;
};

class ProductsService {
  private static TABLE_NAME = DB_TABLE_NAMES.PRODUCTS as string;

  static async getProduct(id: string): Promise<Response> {
    let res: Response = {
      success: false,
      data: {} as IProduct,
      errMessage: "",
    };

    try {
      const params = {
        TableName: this.TABLE_NAME,
        Key: { id },
      };
      const product = await docClient.get(params).promise();

      if(!product.Item) {
        res.errMessage = `Product with id ${id} not found`;
        return res;
      }

      res.success = true;
      res.data = product.Item as IProduct;

      return res;
    } catch (e: any) {
      res.errMessage = e.message;
      return res;
    }
  }
}

export default ProductsService;
