import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { addProductSchema } from "../utilities/validators/products";
import { ErrorResponseHandler, ResponseHandler, StatusCodes } from "../utilities/ResponseHandler";
import { docClient } from "../utilities/dbHelper";
import ProductsService from "../services/Products";
import { DB_TABLE_NAMES } from "../utilities/constants";
import logger from "../utilities/logger";
import { BadRequestError } from "../utilities/Errors/CustomErrors";

export const addProduct = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info("'addProduct': event called");

  try {
    const validate = addProductSchema.validate(JSON.parse(event.body as string));

    if (validate.error) {
      throw new BadRequestError(validate.error.details[0].message);
    }

    const { name, price, qty } = validate.value;

    const id = Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

    const params = {
      TableName: DB_TABLE_NAMES.PRODUCTS as string,
      Item: {
        id,
        name,
        price,
        qty,
      },
      ConditionExpression: "attribute_not_exists(id)",
    };
    await docClient.put(params).promise();

    return ResponseHandler({
      statusCode: StatusCodes.CREATED,
      body: { data: { message: "Product added successfully" } },
    });
  } catch (e) {
    return ResponseHandler({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      body: { data: { message: JSON.stringify(e) } },
    });
  }
};

export const getProducts = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const params = {
      TableName: DB_TABLE_NAMES.PRODUCTS as string,
    };
    const products = await docClient.scan(params).promise();

    return ResponseHandler({
      statusCode: StatusCodes.OK,
      body: { data: { message: products } },
    });
  } catch (e) {
    return ResponseHandler({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      body: { data: { message: JSON.stringify(e) } },
    });
  }
};

export const getProduct = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;

  try {
    const product = await ProductsService.getProduct(id || "");

    return ResponseHandler({
      statusCode: StatusCodes.OK,
      body: { data: product },
    });
  } catch (e) {
    return ResponseHandler({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      body: { data: JSON.stringify(e) },
    });
  }
};

export const updateProduct = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const productId = event.pathParameters?.id;
  const validate = addProductSchema.validate(JSON.parse(event.body as string));

  try {
    if (validate.error) {
      return ResponseHandler({
        statusCode: StatusCodes.BAD_REQUEST,
        body: { data: { message: validate.error.details[0].message } },
      });
    }

    const { name, price, qty } = validate.value;

    const res = await ProductsService.updateProduct({
      id: productId || "",
      name,
      price,
      qty,
    });

    if (!res.success) {
      throw new BadRequestError(res.errMessage as string);
    }

    return ResponseHandler({
      statusCode: StatusCodes.CREATED,
      body: { data: { message: "Product edited successfully" } },
    });
  } catch (e) {
    return ErrorResponseHandler(e);
  }
};

export const deleteProduct = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const productId = event.pathParameters?.id;

  try {
    const params = {
      TableName: DB_TABLE_NAMES.PRODUCTS as string,
      Key: {
        id: productId,
      },
      ConditionExpression: "attribute_exists(id)",
    };
    await docClient.delete(params).promise();

    return ResponseHandler({
      statusCode: StatusCodes.CREATED,
      body: { data: { message: "Product deleted successfully" } },
    });
  } catch (e) {
    return ResponseHandler({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      body: { data: { message: JSON.stringify(e) } },
    });
  }
};
