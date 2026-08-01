import { Router } from 'express';
import { protect, requireRole, requireStaff } from '../middleware/auth';
import {
  createUser,
  deactivateUser,
  getUser,
  listTechnicians,
  listUsers,
  setTechnicianStatus,
  updateUser,
} from '../controllers/userController';

const router = Router();

router.use(protect);

router.get('/technicians', requireStaff, listTechnicians);
router.patch('/:id/technician-status', requireRole('technician', 'dispatcher', 'admin'), setTechnicianStatus);

router.get('/', requireStaff, listUsers);
router.post('/', requireRole('admin'), createUser);
router.get('/:id', requireStaff, getUser);
router.patch('/:id', requireRole('admin'), updateUser);
router.delete('/:id', requireRole('admin'), deactivateUser);

export default router;
