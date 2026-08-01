import { Router } from 'express';
import { protect, requireRole, requireStaff } from '../middleware/auth';
import {
  getCustomerSummary,
  getDispatchSummary,
  getOverview,
  getTechnicianSummary,
} from '../controllers/analyticsController';

const router = Router();

router.use(protect);

router.get('/overview', requireRole('admin'), getOverview);
router.get('/dispatch', requireStaff, getDispatchSummary);
router.get('/customer', requireRole('customer'), getCustomerSummary);
router.get('/technician', requireRole('technician'), getTechnicianSummary);

export default router;
