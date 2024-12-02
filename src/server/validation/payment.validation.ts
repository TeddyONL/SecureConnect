import Joi from 'joi';

export const paymentValidation = {
  createPayment: {
    body: Joi.object().keys({
      amount: Joi.number().required().positive(),
      currency: Joi.string().required().length(3), // e.g., 'USD', 'EUR'
      orderId: Joi.string().required()
    })
  },

  updatePayment: {
    params: Joi.object().keys({
      paymentId: Joi.string().required()
    }),
    body: Joi.object().keys({
      status: Joi.string().valid('pending', 'completed', 'expired').required()
    })
  },

  getPayment: {
    params: Joi.object().keys({
      paymentId: Joi.string().required()
    })
  },

  verifyQRCode: {
    body: Joi.object().keys({
      qrHash: Joi.string().required()
    })
  }
};
