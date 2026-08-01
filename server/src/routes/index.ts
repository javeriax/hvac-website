import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import serviceRequestRoutes from './serviceRequestRoutes';
import quotationRoutes from './quotationRoutes';
import jobRoutes from './jobRoutes';
import invoiceRoutes from './invoiceRoutes';
import contractRoutes from './contractRoutes';
import analyticsRoutes from './analyticsRoutes';
import miscRoutes from './miscRoutes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, service: 'ServiceFlow API', time: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/service-requests', serviceRequestRoutes);
router.use('/quotations', quotationRoutes);
router.use('/jobs', jobRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/contracts', contractRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/', miscRoutes);

export default router;
