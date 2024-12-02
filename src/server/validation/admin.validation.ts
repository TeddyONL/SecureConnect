import Joi from 'joi';

export const validateUserRoleUpdate = (data: any) => {
  const schema = Joi.object({
    role: Joi.string().valid('user', 'admin', 'super_admin').required(),
  });

  return schema.validate(data);
};

export const validateVerificationAction = (data: any) => {
  const schema = Joi.object({
    action: Joi.string().valid('approve', 'reject').required(),
    notes: Joi.string().max(500),
  });

  return schema.validate(data);
};

export const validateReportAction = (data: any) => {
  const schema = Joi.object({
    action: Joi.string().valid('resolved', 'rejected', 'flagged').required(),
    notes: Joi.string().max(500),
  });

  return schema.validate(data);
};