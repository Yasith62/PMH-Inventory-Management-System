import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/stats', authenticate, dashboardController.getDashboardStats);

export default router;
