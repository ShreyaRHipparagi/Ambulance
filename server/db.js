import sqlite3 from 'sqlite3';
import { HOSPITALS } from '../src/data/cityData.js';
import fs from 'fs';
import path from 'path';

const DB_PATH = './database.sqlite';

// Create or open DB
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) console.error("Database opening error: ", err);
});

export function initDb() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create tables mapping our existing data
      db.run(`CREATE TABLE IF NOT EXISTS hospitals (
        id TEXT PRIMARY KEY,
        name TEXT,
        icuBedsTotal INTEGER,
        icuBedsAvailable INTEGER,
        generalBedsTotal INTEGER,
        generalBedsAvailable INTEGER
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS emergency_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patientName TEXT,
        emergencyType TEXT,
        sourceNodeId INTEGER,
        needsIcu BOOLEAN,
        primaryHospital TEXT,
        backupHospital TEXT,
        routeCost REAL,
        algorithm TEXT,
        timestamp TEXT
      )`);

      // Seed hospitals if table is empty
      db.get(`SELECT COUNT(*) as count FROM hospitals`, (err, row) => {
        if (err) return reject(err);
        if (row.count === 0) {
          const stmt = db.prepare(`INSERT INTO hospitals (id, name, icuBedsTotal, icuBedsAvailable, generalBedsTotal, generalBedsAvailable) VALUES (?, ?, ?, ?, ?, ?)`);
          HOSPITALS.forEach(h => {
            stmt.run(h.id, h.name, h.icuBedsTotal, h.icuBedsAvailable, h.generalBedsTotal, h.generalBedsAvailable);
          });
          stmt.finalize();
          console.log("Database seeded with initial hospital data.");
        }
        resolve();
      });
    });
  });
}

export default db;
