import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export class AuthController {
  static async oauth(req: Request, res: Response): Promise<void> {
    try {
      const { id_token } = req.body;
      if (!id_token) {
        res.status(400).json({ error: 'Missing id_token' });
        return;
      }
      
      const { email, name, provider } = await AuthService.verifyGoogleToken(id_token);
      const user = await AuthService.findOrCreateUser(email, name, provider);
      
      const accessToken = AuthService.generateAccessToken(user);
      const refreshToken = await AuthService.generateRefreshToken(user.id);

      const isProduction = process.env.NODE_ENV === 'production';

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax', // Required for cross-domain prod deployments
        maxAge: REFRESH_TOKEN_MAX_AGE,
        path: '/'
      });

      res.json({ accessToken, user });
    } catch (error) {
      console.error(error);
      res.status(401).json({ error: 'Authentication failed' });
    }
  }

  static async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.cookies;
      const userId = req.body.userId; // Provided by frontend or session

      if (!refreshToken || !userId) {
        res.status(401).json({ error: 'Missing token or userId' });
        return;
      }

      const newRefreshToken = await AuthService.validateAndRotateRefreshToken(refreshToken, userId);
      if (!newRefreshToken) {
        res.status(403).json({ error: 'Invalid or expired refresh token' });
        return;
      }

      const db = await (await import('../db')).getDb();
      const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
      
      if (!user) {
        res.status(403).json({ error: 'User not found' });
        return;
      }

      const accessToken = AuthService.generateAccessToken(user);
      const isProduction = process.env.NODE_ENV === 'production';

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax', // Required for cross-domain prod deployments
        maxAge: REFRESH_TOKEN_MAX_AGE,
        path: '/'
      });

      res.json({ accessToken });
    } catch (error) {
      console.error(error);
      res.status(403).json({ error: 'Refresh failed' });
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.body;
      if (userId) await AuthService.revokeAllRefreshTokens(userId);
      res.clearCookie('refreshToken');
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Logout failed' });
    }
  }
}
