import { Router } from 'express';
import * as reportController from '../controllers/report.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/daily-sales', reportController.getDailySales);
router.get('/monthly-revenue', reportController.getMonthlyRevenue);
router.get('/profit', reportController.getProfitAnalysis);

export default router;
