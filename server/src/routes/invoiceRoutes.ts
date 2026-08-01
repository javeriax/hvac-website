import { Router } from 'express';
import { protect, requireRole, requireStaff } from '../middleware/auth';
import {
  createInvoice,
  getInvoice,
  listInvoices,
  listPayments,
  recordPayment,
  sendInvoice,
  updateInvoice,
  voidInvoice,
} from '../controllers/invoiceController';

const router = Router();

router.use(protect);

router.get('/payments', listPayments);

router.get('/', listInvoices);
router.post('/', requireStaff, createInvoice);
router.get('/:id', getInvoice);
router.patch('/:id', requireStaff, updateInvoice);
router.post('/:id/send', requireStaff, sendInvoice);
router.post('/:id/void', requireRole('admin'), voidInvoice);

// Customers can settle their own invoice from the portal (simulated gateway).
router.post('/:id/payments', recordPayment);

export default router;
