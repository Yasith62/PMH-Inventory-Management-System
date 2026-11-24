import { body, param } from 'express-validator';

export const supplierIdValidator = [param('id').isInt({ min: 1 }).withMessage('Valid supplier ID required')];

export const supplierBodyValidator = [
  body('name').trim().notEmpty().withMessage('Supplier name is required'),
  body('contact').trim().notEmpty().withMessage('Contact is required'),
  body('address').optional().trim(),
];
