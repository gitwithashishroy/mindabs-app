import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_me';

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string };
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        res.status(401).json({ error: 'AccessToken is expired or invalid' });
        return;
      }
      req.user = user as { id: string; email: string; role: string };
      next();
    });
  } else {
    res.status(401).json({ error: 'Authorization header missing' });
  }
};
