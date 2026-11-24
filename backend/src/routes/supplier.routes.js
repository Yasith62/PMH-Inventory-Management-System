import { Router } from 'express';
import * as supplierController from '../controllers/supplier.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { supplierBodyValidator, supplierIdValidator } from '../validators/supplier.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', supplierController.getSuppliers);
router.get('/:id', supplierIdValidator, validate, supplierController.getSupplier);

router.post('/', authorize('admin'), supplierBodyValidator, validate, supplierController.createSupplier);
router.put('/:id', authorize('admin'), supplierIdValidator, supplierBodyValidator, validate, supplierController.updateSupplier);
router.delete('/:id', authorize('admin'), supplierIdValidator, validate, supplierController.deleteSupplier);

export default router;
