import { body, param } from 'express-validator';

export const purchaseIdValidator = [param('id').isInt({ min: 1 }).withMessage('Valid purchase ID required')];

export const purchaseBodyValidator = [
  body('supplier_id').isInt({ min: 1 }).withMessage('Valid supplier is required'),
  body('date').isISO8601().toDate().withMessage('Valid date is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.product_id').isInt({ min: 1 }).withMessage('Valid product ID required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.cost_price').isFloat({ min: 0 }).withMessage('Cost price must be positive'),
];
