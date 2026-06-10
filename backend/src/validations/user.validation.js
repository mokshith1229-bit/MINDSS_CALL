const Joi = require('joi');

const updateUserRole = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
  body: Joi.object().keys({
    role: Joi.string().valid('SUPER_ADMIN', 'ADMIN', 'EMPLOYEE', 'EVALUATOR', 'HOD', 'FINANCE').required(),
  }),
};

const deleteUser = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

module.exports = {
  updateUserRole,
  deleteUser,
};
