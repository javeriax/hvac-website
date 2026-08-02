import { Router } from 'express';
import { protect, requireRole, requireStaff } from '../middleware/auth';
import {
  cancelContract,
  createContract,
  getContract,
  listContracts,
  listPlans,
  renewContract,
  sendRenewalReminders,
  toggleAutoRenew,
  upsertPlan,
} from '../controllers/contractController';

const router = Router();

// Plan catalogue is public, the marketing site renders it.
router.get('/plans', listPlans);

router.use(protect);

router.post('/plans', requireRole('admin'), upsertPlan);
router.patch('/plans/:id', requireRole('admin'), upsertPlan);
router.post('/reminders', requireStaff, sendRenewalReminders);

router.get('/', listContracts);
router.post('/', createContract);
router.get('/:id', getContract);
router.post('/:id/renew', renewContract);
router.post('/:id/cancel', cancelContract);
router.patch('/:id/auto-renew', toggleAutoRenew);

export default router;
