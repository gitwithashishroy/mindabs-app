import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import * as xlsx from 'xlsx';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import { getDb } from './db';
import situationRoutes from './routes/situation.routes';

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Dilemma REST API',
            version: '1.0.0',
            description: 'Simple CRUD API for Excel ingested data',
        },
    },
    apis: ['./src/routes/*.ts', './src/index.ts'],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: API Health Check
 *     responses:
 *       200:
 *         description: OK
 */
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'UP' });
});

/**
 * @swagger
 * /import:
 *   post:
 *     summary: Import data from an Excel file
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Successfully imported.
 */
app.post('/import', upload.single('file'), async (req: Request, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        
        const db = await getDb();
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const rows = xlsx.utils.sheet_to_json<any>(workbook.Sheets[sheetName]);

        for (const row of rows) {
            await db.run(
                'INSERT INTO situations (scenario, age_group, cognitive_pillar, difficulty, question, options, expected_outcome) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [row.scenario, row.age_group, row.cognitive_pillar, row.difficulty, row.question, row.options, row.expected_outcome]
            );
        }

        res.json({ message: `Successfully imported ${rows.length} rows.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to ingest excel' });
    }
});

app.use('/situation', situationRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
    await getDb(); // Init DB
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Docs available at http://localhost:${PORT}/api-docs`);
});
