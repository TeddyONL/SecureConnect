import Joi from 'joi';

export const validateMessageInput = (data: any) => {
  const schema = Joi.object({
    content: Joi.string().min(1).max(1000).required(),
    receiverId: Joi.string().required(),
  });

  return schema.validate(data);
};