import Joi from "@hapi/joi";

export const addProductSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().required(),
  qty: Joi.number().required(),
});
