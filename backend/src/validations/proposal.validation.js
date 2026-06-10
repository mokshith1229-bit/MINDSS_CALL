const Joi = require('joi');

const createProposal = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
    category: Joi.string().required(),
    department: Joi.string().required(),
    budgetRequired: Joi.number().min(0),
    status: Joi.string().valid('DRAFT', 'PENDING_L1'), // Initial status
  }),
};

const updateStatus = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
  body: Joi.object().keys({
    status: Joi.string().valid('DRAFT', 'PENDING_L1', 'EVALUATION', 'FINANCE_REVIEW', 'APPROVED', 'REJECTED', 'REWORK').required(),
    note: Joi.string().allow(''),
  }),
};

const assignProposal = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
  body: Joi.object().keys({
    assignedTo: Joi.string().required(), // User ID of evaluator
  }),
};

module.exports = {
  createProposal,
  updateStatus,
  assignProposal,
};
