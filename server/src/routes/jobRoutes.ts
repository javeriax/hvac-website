import { Router } from 'express';
import { protect, requireRole, requireStaff } from '../middleware/auth';
import { upload } from '../middleware/upload';
import {
  addJobNote,
  assignTechnician,
  captureSignature,
  createJob,
  getJob,
  listJobs,
  rescheduleJob,
  submitReport,
  toggleChecklistItem,
  updateJobStatus,
  uploadJobPhotos,
} from '../controllers/jobController';

const router = Router();

router.use(protect);

router.get('/', listJobs);
router.post('/', requireStaff, createJob);
router.get('/:id', getJob);

router.post('/:id/assign', requireStaff, assignTechnician);
router.post('/:id/reschedule', requireStaff, rescheduleJob);

const fieldRoles = requireRole('technician', 'dispatcher', 'admin');
router.patch('/:id/status', fieldRoles, updateJobStatus);
router.patch('/:id/checklist', fieldRoles, toggleChecklistItem);
router.post('/:id/notes', fieldRoles, addJobNote);
router.post('/:id/photos', fieldRoles, upload.array('photos', 8), uploadJobPhotos);
router.post('/:id/signature', fieldRoles, captureSignature);
router.post('/:id/report', fieldRoles, submitReport);

export default router;
