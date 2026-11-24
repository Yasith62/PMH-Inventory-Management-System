import { Router } from 'express';
import * as productController from '../controllers/product.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { productBodyValidator, productIdValidator } from '../validators/product.validator.js';

const router = Router();

router.use(authenticate);

router.get('/low-stock', productController.getLowStock);
router.get('/', productController.getProducts);
router.get('/:id', productIdValidator, validate, productController.getProduct);

router.post('/', authorize('admin'), productBodyValidator, validate, productController.createProduct);
router.put('/:id', authorize('admin'), productIdValidator, productBodyValidator, validate, productController.updateProduct);
router.delete('/:id', authorize('admin'), productIdValidator, validate, productController.deleteProduct);

export default router;
