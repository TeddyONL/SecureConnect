import Joi from 'joi';

export const validateReviewInput = (data: any) => {
  const schema = Joi.object({
    rating: Joi.number().integer().min(1).max(5).required(),
    content: Joi.string().min(10).max(1000).required(),
    photos: Joi.array().items(Joi.string().uri()).max(5),
  });

  return schema.validate(data);
};