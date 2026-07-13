const Joi = require('joi');

const createUser = {
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(80),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(6),
    role: Joi.string().valid('SUPER_ADMIN', 'ADMIN', 'EMPLOYEE', 'EVALUATOR', 'HOD', 'FINANCE').required(),
    department: Joi.string().allow('', null).optional(),
  }),
};

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
  createUser,
  updateUserRole,
  deleteUser,
};
