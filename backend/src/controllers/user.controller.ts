import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { getDb } from '../db';

export class UserController {
  static async updateRole(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (role !== 'user' && role !== 'admin') {
         res.status(400).json({ error: 'Invalid role. Must be user or admin.' });
         return;
      }

      const db = await getDb();
      const result = await db.run('UPDATE users SET role = ? WHERE id = ?', [role, id]);

      if (result.changes === 0) {
         res.status(404).json({ error: 'User not found' });
         return;
      }
      
      const updatedUser = await db.get('SELECT id, email, name, provider, role, createdAt FROM users WHERE id = ?', [id]);
      res.json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update user role' });
    }
  }

  static async getUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const db = await getDb();
      const users = await db.all('SELECT id, email, name, provider, role, createdAt FROM users');
      res.json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }
}
