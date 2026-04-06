import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

let db: Database<sqlite3.Database, sqlite3.Statement>;

export const getDb = async () => {
  if (db) return db;
  db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS situations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      scenario TEXT,
      age_group TEXT,
      cognitive_pillar TEXT,
      difficulty TEXT,
      question TEXT,
      options TEXT,
      expected_outcome TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return db;
};
