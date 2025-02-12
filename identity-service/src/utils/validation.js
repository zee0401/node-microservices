import Joi from "joi";

export const registerValidation = (data) => {
  const schema = Joi.object({
    username: Joi.string()
      .min(3)
      .max(20)
      .required()
      .error(new Error("Username is required")),
    email: Joi.string()
      .email()
      .required()
      .error(new Error("Email is required")),
    password: Joi.string()
      .min(6)
      .max(20)
      .required()
      .error(new Error("Password is required")),
  });
  return schema.validate(data);
};
