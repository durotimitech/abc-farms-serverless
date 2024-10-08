import { IProduct } from "../types/products";
import { DB_TABLE_NAMES, docClient } from "../utilities/dbHelper";

class ProductsService {
  private static TABLE_NAME = DB_TABLE_NAMES.PRODUCTS as string;

  static async getProduct(id: string): Promise<IProduct> {
    try {
      const params = {
        TableName: this.TABLE_NAME,
        Key: { id },
      };
      const product = await docClient.get(params).promise();
      return product.Item as IProduct;
    } catch (e: any) {
      return e.message;
    }
  }
}

export default ProductsService;
