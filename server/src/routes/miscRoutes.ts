import { Router } from 'express';
import { protect, requireRole, requireStaff } from '../middleware/auth';
import {
  listContactMessages,
  listEquipment,
  listNotifications,
  listTestimonials,
  markAllNotificationsRead,
  markNotificationRead,
  submitContactMessage,
  updateContactMessage,
  upsertEquipment,
} from '../controllers/miscController';

const router = Router();

/* public */
router.post('/contact', submitContactMessage);
router.get('/testimonials', listTestimonials);

/* notifications */
router.get('/notifications', protect, listNotifications);
router.patch('/notifications/read-all', protect, markAllNotificationsRead);
router.patch('/notifications/:id/read', protect, markNotificationRead);

/* back office */
router.get('/contact-messages', protect, requireStaff, listContactMessages);
router.patch('/contact-messages/:id', protect, requireStaff, updateContactMessage);

router.get('/equipment', protect, requireStaff, listEquipment);
router.post('/equipment', protect, requireRole('admin'), upsertEquipment);
router.patch('/equipment/:id', protect, requireRole('admin'), upsertEquipment);

export default router;
