import Joi from "@hapi/joi";

export const createOrderSchema = Joi.object({
  orderItems: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required(),
        qty: Joi.number().required(),
      }),
    )
    .required(),
});
