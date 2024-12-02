import Joi from 'joi';

export const validateBusinessInput = (data: any) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().min(10).max(1000).required(),
    category: Joi.string().required(),
    imageUrl: Joi.string().uri().required(),
    operatingHours: Joi.array().items(
      Joi.object({
        day: Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday').required(),
        open: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
        close: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
        isClosed: Joi.boolean().required(),
      })
    ).length(7).required(),
    location: Joi.object({
      address: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string(),
      country: Joi.string().required(),
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required(),
    }).required(),
    contact: Joi.object({
      phone: Joi.string().required(),
      email: Joi.string().email().required(),
      website: Joi.string().uri().allow(''),
    }).required(),
    features: Joi.array().items(Joi.string()),
    amenities: Joi.array().items(Joi.string()),
  });

  return schema.validate(data);
};

export const validateSearchInput = (data: any) => {
  const schema = Joi.object({
    query: Joi.string().min(2).required(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    filters: Joi.object({
      category: Joi.string(),
      isVerified: Joi.boolean(),
      minRating: Joi.number().min(0).max(5),
    }),
  });

  return schema.validate(data);
};