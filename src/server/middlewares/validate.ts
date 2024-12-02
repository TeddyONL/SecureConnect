import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ApiError } from '../utils/ApiError';

export const validate = (schema: Joi.ObjectSchema) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const validationOptions = {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true, // remove unknown props
  };

  const { error, value } = schema.validate(
    {
      body: req.body,
      query: req.query,
      params: req.params,
    },
    validationOptions
  );

  if (error) {
    const errorMessage = error.details
      .map((details) => details.message)
      .join(', ');
    return next(new ApiError(400, errorMessage));
  }

  // Replace request values with validated values
  req.body = value.body;
  req.query = value.query;
  req.params = value.params;
  
  return next();
};