'use client';

import axios from 'axios';
import styles from './page.module.scss';
import useSWR from 'swr';
import { Toaster } from 'react-hot-toast';
import { z } from 'zod';
import { Situation, SituationSchema } from './types/situation';
import UploadSection from './components/UploadSection';
import SituationCard from './components/SituationCard';

const fetcher = async (url: string) => {
  const res = await axios.get(url);
  const parsed = z.array(SituationSchema).safeParse(res.data);
  if (!parsed.success) {
    console.warn("Payload validation errors:", parsed.error);
    return res.data;
  }
  return parsed.data;
};

export default function Home() {
  const { data: situations, error, mutate } = useSWR<Situation[]>('http://localhost:3001/situation', fetcher);

  return (
    <main className={styles.container}>
      <Toaster position="top-center" reverseOrder={false} />

      <header className={styles.headerArea}>
        <h1 className={styles.title}>MindAbs Dashboard</h1>
        <p className={styles.subtitle}>Scenario-Driven Cognitive Experience</p>
      </header>
      
      <UploadSection mutate={mutate} />

      <div className={styles.listSection}>
        <h2>Scenarios</h2>
        {error && <p className={styles.error}>Error loading scenarios. Is the backend running?</p>}
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
