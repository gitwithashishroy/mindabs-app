import { signOut } from 'next-auth/react';
import styles from './ErrorCard.module.scss';
import React from 'react';

interface ErrorCardProps {
  error: Error | { message: string } | any;
  retry?: () => void;
}

export default function ErrorCard({ error, retry }: ErrorCardProps) {
  const errorMessage = error?.message || 'Something went unexpectedly wrong. Is the backend running?';
  const isUnauthorized = errorMessage.toLowerCase().includes('unauthorized');

  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorIcon}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div className={styles.errorContent}>
        <h3 className={styles.errorTitle}>
          {isUnauthorized ? 'Session Expired' : 'Connection Error'}
        </h3>
        <p className={styles.errorMessage}>{errorMessage}</p>
        
        <div className={styles.actionGroup}>
          {isUnauthorized ? (
            <button className={styles.actionButton} onClick={() => signOut()}>
              Log Out to Re-authenticate
            </button>
          ) : (
            retry && (
              <button className={styles.actionButton} onClick={retry}>
                Try Again
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
