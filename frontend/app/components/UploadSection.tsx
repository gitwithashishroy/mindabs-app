'use client';

import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../page.module.scss';
import { KeyedMutator } from 'swr';
import { Situation } from '../types/situation';

interface UploadSectionProps {
  mutate: KeyedMutator<Situation[]>;
}

export default function UploadSection({ mutate }: UploadSectionProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const uploadFile = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setIsUploading(true);
    
    toast.promise(
      axios.post('http://localhost:3001/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }),
      {
        loading: 'Processing Excel Payload...',
        success: () => {
          setFile(null);
          mutate();
          return 'Scenarios Uploaded Successfully!';
        },
        error: 'Upload Failed. Ensure correct Excel Structure.',
      }
    ).finally(() => setIsUploading(false));
  };

  return (
    <div className={styles.uploadSection}>
      <h2>Upload Data (Excel)</h2>
      <div className={styles.uploadControls}>
        <input 
          type="file" 
          accept=".xlsx, .xls" 
          onChange={handleFileChange} 
          disabled={isUploading}
        />
        <button onClick={uploadFile} disabled={!file || isUploading}>
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </div>
  );
}
