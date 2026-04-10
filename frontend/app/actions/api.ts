'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function customFetch(endpoint: string, options: RequestInit = {}) {
  const session: any = await getServerSession(authOptions);
  
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  headers.set('Accept', 'application/json');
  
  if (session?.accessToken) {
    headers.set('Authorization', `Bearer ${session.accessToken}`);
  }

  // Forward refreshToken cookie from Next.js server to the Node API
  const cookieStore = cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;
  if (refreshToken) {
    headers.set('Cookie', `refreshToken=${refreshToken}`);
  }

  let response = await fetch(`${BACKEND_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    const refreshRes = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `refreshToken=${refreshToken}`
      },
      body: JSON.stringify({ userId: session?.user?.id })
    });

    if (refreshRes.ok) {
      const data = await refreshRes.json();
      
      // Update Authorization header with the new token
      headers.set('Authorization', `Bearer ${data.accessToken}`);
      
      // Safely check if set-cookie header exists from the backend refresh explicitly
      const newSetCookie = refreshRes.headers.get('set-cookie');
      if (newSetCookie) {
        // Technically NextJS server actions should set this cookie to the client
        // but for now we forward the updated token to the retried request
        headers.set('Cookie', newSetCookie);
      }

      response = await fetch(`${BACKEND_URL}${endpoint}`, {
        ...options,
        headers,
      });
    } else {
      throw new Error("unauthorized");
    }
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    throw new Error(`API Request failed: ${response.status} ${errorText}`);
  }

  return response.json();
}
