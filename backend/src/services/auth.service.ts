import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db';
import { User } from '../models/user.model';
import { RefreshToken } from '../models/refreshToken.model';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_me';
const ACCESS_TOKEN_EXPIRY = '15m'; 
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

export class AuthService {
  static async verifyGoogleToken(idToken: string) {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) throw new Error('Invalid Google token');

    return {
      email: payload.email,
      name: payload.name || '',
      provider: 'google'
    };
  }

  static async findOrCreateUser(email: string, name: string, provider: string): Promise<User> {
    const db = await getDb();
    const existingUser = await db.get<User>('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existingUser) return existingUser;

    const newUser: User = {
      id: uuidv4(),
      email,
      name,
      provider,
      role: 'user'
    };

    await db.run(
      'INSERT INTO users (id, email, name, provider, role) VALUES (?, ?, ?, ?, ?)',
      [newUser.id, newUser.email, newUser.name, newUser.provider, newUser.role]
    );

    return newUser;
  }

  static generateAccessToken(user: User): string {
    return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });
  }

  static async generateRefreshToken(userId: string): Promise<string> {
    const db = await getDb();
    const rawToken = uuidv4();
    const hashedToken = await bcrypt.hash(rawToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await db.run(
      'INSERT INTO refresh_tokens (id, userId, token, expiresAt) VALUES (?, ?, ?, ?)',
      [uuidv4(), userId, hashedToken, expiresAt.toISOString()]
    );

    return rawToken;
  }

  static async validateAndRotateRefreshToken(rawToken: string, userId: string): Promise<string | null> {
    const db = await getDb();
    const tokens = await db.all<RefreshToken[]>('SELECT * FROM refresh_tokens WHERE userId = ?', [userId]);

    for (const tokenRecord of tokens) {
      const isValid = await bcrypt.compare(rawToken, tokenRecord.token);
      if (isValid) {
        if (new Date(tokenRecord.expiresAt) < new Date()) {
          await db.run('DELETE FROM refresh_tokens WHERE id = ?', [tokenRecord.id]);
          return null;
        }
        // Rotate: Delete old token
        await db.run('DELETE FROM refresh_tokens WHERE id = ?', [tokenRecord.id]);
        return this.generateRefreshToken(userId);
      }
    }
    return null;
  }

  static async revokeAllRefreshTokens(userId: string) {
    const db = await getDb();
    await db.run('DELETE FROM refresh_tokens WHERE userId = ?', [userId]);
  }
}
