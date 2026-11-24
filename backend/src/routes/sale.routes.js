import { Router } from 'express';
import * as saleController from '../controllers/sale.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { saleBodyValidator, saleIdValidator } from '../validators/sale.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', saleController.getSales);
router.get('/:id', saleIdValidator, validate, saleController.getSale);
router.post('/', authorize('admin', 'staff'), saleBodyValidator, validate, saleController.createSale);

export default router;
