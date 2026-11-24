import { body, param } from 'express-validator';

export const productIdValidator = [param('id').isInt({ min: 1 }).withMessage('Valid product ID required')];

export const productBodyValidator = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('brand').trim().notEmpty().withMessage('Brand is required'),
  body('vehicle_type').trim().notEmpty().withMessage('Vehicle type is required'),
  body('part_type').trim().notEmpty().withMessage('Part type is required'),
  body('genuine_status').optional(),
  body('cost_price').isFloat({ min: 0 }).withMessage('Cost price must be a positive number'),
  body('selling_price').isFloat({ min: 0 }).withMessage('Selling price must be a positive number'),
  body('discount_price').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Discount price must be positive'),
  body('stock_qty').optional().isInt({ min: 0 }).withMessage('Stock quantity must be non-negative'),
  body('reorder_level').optional().isInt({ min: 0 }).withMessage('Reorder level must be non-negative'),
];
