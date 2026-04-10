'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import styles from './LoginButton.module.scss';

export default function LoginButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <button onClick={() => signOut()} className={styles.logoutButton}>
        Sign out
      </button>
    );
  }
  return (
    <button onClick={() => signIn('google')} className={styles.loginButton}>
      Sign in with Google
    </button>
  );
}
