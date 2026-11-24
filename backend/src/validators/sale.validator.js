import { body, param } from 'express-validator';

export const saleIdValidator = [param('id').isInt({ min: 1 }).withMessage('Valid sale ID required')];

export const saleBodyValidator = [
  body('date').isISO8601().toDate().withMessage('Valid date is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.product_id').isInt({ min: 1 }).withMessage('Valid product ID required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.selling_price').optional().isFloat({ min: 0 }).withMessage('Selling price must be positive'),
];
