import { Router, RequestHandler } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';

const router = Router();

router.use(authenticateJWT as RequestHandler);
router.use(requireAdmin as RequestHandler);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (Admin only)
 *     responses:
 *       200:
 *         description: Array of users
 */
router.get('/', UserController.getUsers as RequestHandler);

/**
 * @swagger
 * /users/{id}/role:
 *   patch:
 *     summary: Promote or demote a user (Admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *     responses:
 *       200:
 *         description: User updated
 */
router.patch('/:id/role', UserController.updateRole as RequestHandler);

export default router;