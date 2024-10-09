import { IProduct } from "../types/products";
import { IServiceResponse } from "../types/types";
import { DB_TABLE_NAMES } from "../utilities/constants";
import { docClient } from "../utilities/dbHelper";

type IGetProductResponse = IServiceResponse & {
  data: IProduct;
};


class ProductsService {
  private static TABLE_NAME = DB_TABLE_NAMES.PRODUCTS as string;

  static async getProduct(id: string): Promise<IGetProductResponse> {
    let res: IGetProductResponse = {
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

      if (!product.Item) {
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

  static async updateProduct(data: IProduct): Promise<IServiceResponse> {
    let res: IServiceResponse = {
      success: false,
      errMessage: "",
    };

    const { id, name, price, qty } = data;

    try {

      // Check if product exists
      const product = await this.getProduct(id);

      if (!product.success) {
        res.errMessage = product.errMessage as string;
        return res
      }

      // Update product
      const params = {
        TableName: DB_TABLE_NAMES.PRODUCTS as string,
        Key: {id},
        UpdateExpression: "set #name = :name, #price = :price, #qty = :qty",
        ExpressionAttributeNames: {
          "#name": "name",
          "#price": "price",
          "#qty": "qty",
        },
        ExpressionAttributeValues: {
          ":name": name,
          ":price": price,
          ":qty": qty,
        },
        ConditionExpression: "attribute_exists(id)",
      };
      await docClient.update(params).promise();

      res.success = true;

      return res;
    } catch (e: any) {
      res.errMessage = e.message;
      return res;
    }
  }
}

export default ProductsService;
