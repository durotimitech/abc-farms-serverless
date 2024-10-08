import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createOrderSchema } from "../utilities/validators/orders";
import { ResponseHandler, StatusCodes } from "../utilities/ResponseHandler";
import { ICreateOrder } from "../types/orders";
import ProductsService from "../services/Products";
import OrdersService from "../services/Orders";

export const createOrder = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const validate = createOrderSchema.validate(JSON.parse(event.body as string));

  if (validate.error) {
    return ResponseHandler({
      statusCode: StatusCodes.BAD_REQUEST,
      body: { message: validate.error.details[0].message },
    });
  }

  const { orderItems } = validate.value;

  try {
    await Promise.all(
      orderItems.map(async ({ productId, qty }: ICreateOrder) => {
        const product = await ProductsService.getProduct(productId);
        if (product && product.qty >= qty) {
          const orderTotal = OrdersService.calculateOrderTotal({ qty, price: product.price });
          //   const orderId = await placeOrder(item, orderTotal, req, res);
          //   await updateProductQuantity(item, product, res);
          //   sendEmail({
          //     emails: [req.user.email, process.env.EMAIL],
          //     subject: "Your order has been confirmed",
          //     emailType: "order create",
          //     content: {},
          //   });
        }
      }),
    );

    return ResponseHandler({
      statusCode: StatusCodes.CREATED,
      body: { message: "Order created successfully" },
    });
  } catch (e) {
    return ResponseHandler({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      body: { message: JSON.stringify(e) },
    });
  }
};
