export interface RefreshToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: string | Date;
  createdAt?: string;
}
