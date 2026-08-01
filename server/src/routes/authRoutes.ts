import { Router } from 'express';
import { protect } from '../middleware/auth';
import {
  changePassword,
  login,
  me,
  register,
  updateProfile,
} from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, me);
router.patch('/me', protect, updateProfile);
router.post('/change-password', protect, changePassword);

export default router;
