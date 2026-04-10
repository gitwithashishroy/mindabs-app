export interface User {
  id: string;
  email: string;
  name: string;
  provider: string;
  role: 'user' | 'admin';
  createdAt?: string;
}
