'use client';

import apiClient from '../lib/apiClient';
import styles from './page.module.scss';
import useSWR from 'swr';
import { Toaster } from 'react-hot-toast';
import { z } from 'zod';
import { Situation, SituationSchema } from './types/situation';
import UploadSection from './components/UploadSection';
import SituationCard from './components/SituationCard';
import LoginButton from './components/LoginButton';
import ErrorCard from './components/ErrorCard';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const fetcher = async (url: string) => {
  const res = await apiClient.get(url);
  const parsed = z.array(SituationSchema).safeParse(res.data);
  if (!parsed.success) {
    console.warn("Payload validation errors:", parsed.error);
    return res.data;
  }
  return parsed.data;
};

export default function Home() {
  const { data: session, status } = useSession();
  const { data: situations, error, mutate } = useSWR<Situation[]>('/situation', fetcher);

  if (status === 'loading') return <div className={styles.loadingContainer}>Loading session...</div>;

  if (!session) {
    return (
      <main className={styles.container}>
        <header className={styles.headerArea}>
          <h1 className={styles.title}>MindAbs Dashboard</h1>
          <LoginButton />
        </header>
        <p style={{textAlign: 'center', marginTop: '2rem'}}>Please log in to view the dashboard.</p>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <Toaster position="top-center" reverseOrder={false} />

      <header className={styles.headerArea}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className={styles.title}>MindAbs Dashboard</h1>
            <p className={styles.subtitle}>Scenario-Driven Cognitive Experience</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {session.role === 'admin' && (
              <Link href="/admin/users" style={{ color: 'blue', textDecoration: 'underline' }}>
                Manage Users
              </Link>
            )}
            <LoginButton />
          </div>
        </div>
      </header>
      
      {session.role === 'admin' && <UploadSection mutate={mutate} />}

      <div className={styles.listSection}>
        <h2>Scenarios</h2>
        {error && <ErrorCard error={error} retry={() => mutate()} />}
        {!situations && !error && (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>Fetching scenarios intelligently...</p>
            </div>
        )}
        {situations && situations.length === 0 && <p className={styles.empty}>No scenarios found. Upload an Excel payload to begin.</p>}
        
        <div className={styles.flexList}>
          {situations?.map((s) => (
            <SituationCard key={s.id} situation={s} mutate={mutate} />
          ))}
        </div>
      </div>
    </main>
  );
}
