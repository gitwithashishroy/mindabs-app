import { Router } from 'express';
import { getAllSituations, getSituationById, createSituation, updateSituation, deleteSituation } from '../controllers/situation.controller';

const router = Router();

/**
 * @swagger
 * /situation:
 *   get:
 *     summary: Get all situations
 *     responses:
 *       200:
 *         description: Array of situations
 */
router.get('/', getAllSituations);

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
router.get('/:id', getSituationById);

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
router.post('/', createSituation);

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
router.put('/:id', updateSituation);

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
router.delete('/:id', deleteSituation);

export default router;
