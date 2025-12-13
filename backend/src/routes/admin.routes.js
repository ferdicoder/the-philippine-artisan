import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { dashboard } from '../controllers/admin.controller.js';

const router = Router();
router.get('/dashboard', authenticate, authorize('Admin'), dashboard);

export default router;
