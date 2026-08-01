import { Router } from 'express';
import { optionalAuth, protect, requireStaff } from '../middleware/auth';
import { upload } from '../middleware/upload';
import {
  cancelServiceRequest,
  claimServiceRequest,
  createServiceRequest,
  getServiceRequest,
  listServiceRequests,
  trackServiceRequest,
  updateRequestStatus,
} from '../controllers/serviceRequestController';

const router = Router();

// Guests can raise a request and follow it by tracking code without an account.
router.post('/', optionalAuth, upload.array('photos', 6), createServiceRequest);
router.get('/track/:code', trackServiceRequest);

router.use(protect);
router.get('/', listServiceRequests);
router.post('/claim', claimServiceRequest);
router.get('/:id', getServiceRequest);
router.patch('/:id/status', requireStaff, updateRequestStatus);
router.post('/:id/cancel', cancelServiceRequest);

export default router;
