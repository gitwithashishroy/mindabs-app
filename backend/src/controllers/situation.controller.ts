import { Request, Response } from 'express';
import { getDb } from '../db';
import { SituationSchema, UpdateSituationSchema } from '../schemas/situation.schema';

export const getAllSituations = async (req: Request, res: Response) => {
    try {
        const db = await getDb();
        const rows = await db.all('SELECT * FROM situations ORDER BY created_at DESC');
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message || 'Failed to fetch' });
    }
};

export const getSituationById = async (req: Request, res: Response) => {
    try {
        const db = await getDb();
        const row = await db.get('SELECT * FROM situations WHERE id = ?', req.params.id);
        if (!row) return res.status(404).json({ error: 'Not Found' });
        res.json(row);
    } catch (err: any) {
        res.status(500).json({ error: err.message || 'Error fetching' });
    }
};

export const createSituation = async (req: Request, res: Response) => {
    try {
        // Validate with Zod
        const validatedData = SituationSchema.parse(req.body);

        const db = await getDb();
        const result = await db.run(
            'INSERT INTO situations (scenario, age_group, cognitive_pillar, difficulty, question, options, expected_outcome) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                validatedData.scenario,
                validatedData.age_group || '',
                validatedData.cognitive_pillar || '',
                validatedData.difficulty || '',
                validatedData.question,
                validatedData.options || '',
                validatedData.expected_outcome || ''
            ]
        );
        res.status(201).json({ id: result.lastID, ...validatedData });
    } catch (error: any) {
        if (error.errors) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const updateSituation = async (req: Request, res: Response) => {
    try {
        const validatedData = UpdateSituationSchema.parse(req.body);

        const db = await getDb();

        const updateFields: string[] = [];
        const params: any[] = [];

        Object.entries(validatedData).forEach(([key, value]) => {
            if (value !== undefined) {
                updateFields.push(`${key} = ?`);
                params.push(value);
            }
        });

        if (updateFields.length === 0) return res.status(400).json({ error: 'No fields to update' });

        params.push(req.params.id);

        const query = `UPDATE situations SET ${updateFields.join(', ')} WHERE id = ?`;
        await db.run(query, params);
        res.json({ success: true });
    } catch (error: any) {
        if (error.errors) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const deleteSituation = async (req: Request, res: Response) => {
    try {
        const db = await getDb();
        await db.run('DELETE FROM situations WHERE id = ?', req.params.id);
        res.json({ success: true });
    } catch(err) {
        res.status(500).json({ error: 'Delete Failed' });
    }
};
