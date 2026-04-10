'use client';

import { useState } from 'react';
import apiClient from '../../lib/apiClient';
import toast from 'react-hot-toast';
import styles from '../page.module.scss';
import { Situation } from '../types/situation';
import { KeyedMutator } from 'swr';
import { useSession } from 'next-auth/react';

interface SituationCardProps {
  situation: Situation;
  mutate: KeyedMutator<Situation[]>;
}

export default function SituationCard({ situation: s, mutate }: SituationCardProps) {
  const { data: session } = useSession();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteSituation = async () => {
    setIsDeleting(true);
    toast.promise(
      apiClient.delete(`/situation/${s.id}`),
      {
        loading: 'Deleting Scenario...',
        success: () => {
          mutate();
          return 'Scenario Deleted!';
        },
        error: 'Failed to delete scenario.',
      }
    ).finally(() => setIsDeleting(false));
  };

  const optionsList = s.options ? s.options.split('|').map(opt => opt.trim()).filter(Boolean) : [];
  const isSelected = !!selectedOption;

  return (
    <div className={`${styles.card} ${isDeleting ? styles.dimmedCard : ''}`}>
      <div className={styles.cardHeader}>
        <h3>{s.scenario || 'Untitled Scenario'}</h3>
        <div className={styles.badges}>
          {s.age_group && <span className={styles.badgeAge}>{s.age_group}</span>}
          {s.difficulty && <span className={styles.badgeDiff}>{s.difficulty}</span>}
        </div>
      </div>
      
      {s.cognitive_pillar && (
        <p className={styles.pillar}>
          <strong>Cognitive Pillar:</strong> {s.cognitive_pillar}
        </p>
      )}

      <p className={styles.question}>{s.question}</p>
      
      <div className={styles.optionsList}>
        {optionsList.map((opt, idx) => {
          const isActive = selectedOption === opt;
          return (
            <button 
              key={idx} 
              className={`${styles.optionBtn} ${isActive ? styles.selected : ''}`}
              onClick={() => setSelectedOption(opt)}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {isSelected && s.expected_outcome && (
        <div className={styles.feedback}>
          <p><strong>This reflects:</strong> {s.expected_outcome}</p>
        </div>
      )}

      {session?.role === 'admin' && (
        <div className={styles.cardFooter}>
          <button 
            className={styles.dangerBtn} 
            onClick={deleteSituation}
            disabled={isDeleting}
          >
            {isDeleting ? 'Processing...' : 'Delete Scenario'}
          </button>
        </div>
      )}
    </div>
  );
}
