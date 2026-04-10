import { Router } from 'express';
import { getAllSituations, getSituationById, createSituation, updateSituation, deleteSituation } from '../controllers/situation.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';

const router = Router();

// Apply auth middleware to all situation routes
router.use(authenticateJWT as any);

/**
 * @swagger
 * /situation:
 *   get:
 *     summary: Get all situations
 *     responses:
 *       200:
 *         description: Array of situations
 */
router.get('/', getAllSituations as any);

/**
 * @swagger
 * /situation/{id}:
 *   get:
 *     summary: Get situation by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Situation object
 */
router.get('/:id', getSituationById as any);

/**
 * @swagger
 * /situation:
 *   post:
 *     summary: Create new situation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               scenario:
 *                 type: string
 *               question:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', requireAdmin as any, createSituation as any);

/**
 * @swagger
 * /situation/{id}:
 *   put:
 *     summary: Update a situation
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *             schema:
 *               type: object
 *     responses:
 *       200:
 *         description: Updated
 */
router.put('/:id', requireAdmin as any, updateSituation as any);

/**
 * @swagger
 * /situation/{id}:
 *   delete:
 *     summary: Delete a situation
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted
 */
router.delete('/:id', requireAdmin as any, deleteSituation as any);

export default router;
