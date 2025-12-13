import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { getMe, list, getById, create, update, remove } from '../controllers/user.controller.js';
import { authorize } from '../middleware/auth.middleware.js';

const router = Router();

// Current user
router.get('/me', authenticate, getMe);

// Admin-only CRUD for users
router.get('/', authenticate, authorize('Admin'), list);
router.get('/:id', authenticate, authorize('Admin'), getById);
router.post('/', authenticate, authorize('Admin'), create);
router.put('/:id', authenticate, authorize('Admin'), update);
router.delete('/:id', authenticate, authorize('Admin'), remove);

export default router;
