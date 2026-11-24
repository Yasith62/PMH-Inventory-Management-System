import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { loginValidator, registerValidator } from '../validators/auth.validator.js';

const router = Router();

router.post('/login', loginValidator, validate, authController.login);
router.get('/me', authenticate, authController.getMe);

router.post('/register', authenticate, authorize('admin'), registerValidator, validate, authController.register);
router.get('/users', authenticate, authorize('admin'), authController.getUsers);
router.delete('/users/:id', authenticate, authorize('admin'), authController.deleteUser);

export default router;
