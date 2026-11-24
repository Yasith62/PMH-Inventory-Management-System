import { Router } from 'express';
import * as purchaseController from '../controllers/purchase.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { purchaseBodyValidator, purchaseIdValidator } from '../validators/purchase.validator.js';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/', purchaseController.getPurchases);
router.get('/:id', purchaseIdValidator, validate, purchaseController.getPurchase);
router.post('/', purchaseBodyValidator, validate, purchaseController.createPurchase);

export default router;
