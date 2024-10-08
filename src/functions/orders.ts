import { APIGatewayProxyEvent, APIGatewayProxyResult, SQSEvent } from "aws-lambda";
import { createOrderSchema } from "../utilities/validators/orders";
import { ErrorResponseHandler, ResponseHandler, StatusCodes } from "../utilities/ResponseHandler";
import { ICreateOrder } from "../types/orders";
import ProductsService from "../services/Products";
import OrdersService from "../services/Orders";
import { EventBridge } from "aws-sdk";
import { EVENT_BUS_NAME } from "../utilities/constants";
import logger from "../utilities/logger";
import { BadRequestError } from "../utilities/Errors/CustomErrors";

const eventBridgeClient = new EventBridge({ region: "us-east-1" });

export const createOrder = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info("'createOrder': event called");

  try {
    const validate = createOrderSchema.validate(JSON.parse(event.body as string));

    if (validate.error) {
      throw new BadRequestError(validate.error.details[0].message);
    }

    logger.info("'createOrder': request body validated");

    const { orderItems } = validate.value;

    await Promise.all(
      orderItems.map(async ({ productId, qty }: ICreateOrder) => {
        const product = await ProductsService.getProduct(productId);

        logger.info(`'createOrder': ${JSON.stringify(product)}`);

        if (!product.success) {
          throw new BadRequestError(product.errMessage as string);
        }

        logger.info(`'createOrder': product with id ${productId} found`);

        if (qty > product.data.qty) {
          throw new BadRequestError(`Product with id ${productId} has only ${product.data.qty} items left`);
        }

        logger.info(`'createOrder': product with id ${productId} has enough items`);

        logger.info(`'createOrder': creating order for product with id ${productId}`);

        const createOrder = await OrdersService.createOrder({
          productId,
          qty,
          price: product.data.price,
        });

        if (!createOrder.success) {
          throw new BadRequestError(createOrder.errMessage as string);
        }

        logger.info(
          `'createOrder': order created for product with id ${productId} and order id ${createOrder.data.id}`,
        );

        logger.info(`'createOrder': sending event to EventBridge to notify order created`);

        const entry = {
          EventBusName: EVENT_BUS_NAME,
          Detail: JSON.stringify({
            id: createOrder.data.id,
          }),
          Source: "abc-farms-events",
          DetailType: "order-created",
        };
        const eventBridgeParams = { Entries: [entry] };

        await eventBridgeClient.putEvents(eventBridgeParams).promise();
      }),
    );

    return ResponseHandler({
      statusCode: StatusCodes.CREATED,
      body: { data: { message: "Order created successfully" } },
    });
  } catch (e: any) {
    return ErrorResponseHandler(e);
  }
};

export const sendOrderConfirmationEmailToBuyer = async (event: SQSEvent) => {
  logger.info("'sendOrderConfirmationEmailToBuyer': event called");

  const records = event.Records;
  let batchItemFailures = [];

  if (records.length) {
    for (const record of records) {
      try {
        const { id } = JSON.parse(record.body).detail;
        logger.info(`'sendOrderConfirmationEmailToBuyer': email sent with order id ${id}`);
      } catch (e: any) {
        batchItemFailures.push({
          itemIdentifier: record.messageId,
        });
      }
    }
  }

  return { batchItemFailures };
};
