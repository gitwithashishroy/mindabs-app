import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();

router.post('/oauth', AuthController.oauth);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);

export default router;
