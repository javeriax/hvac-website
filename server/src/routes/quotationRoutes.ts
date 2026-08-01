import { Router } from 'express';
import { protect, requireStaff } from '../middleware/auth';
import {
  createQuotation,
  deleteQuotation,
  getQuotation,
  listQuotations,
  respondToQuotation,
  sendQuotation,
  updateQuotation,
} from '../controllers/quotationController';

const router = Router();

router.use(protect);

router.get('/', listQuotations);
router.post('/', requireStaff, createQuotation);
router.get('/:id', getQuotation);
router.patch('/:id', requireStaff, updateQuotation);
router.post('/:id/send', requireStaff, sendQuotation);
router.post('/:id/respond', respondToQuotation);
router.delete('/:id', requireStaff, deleteQuotation);

export default router;
