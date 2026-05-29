import express from 'express';
import cors from 'cors';
import db, { initDb } from './db.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Initialize database
initDb().then(() => {
  console.log('Database initialized successfully.');
}).catch(err => {
  console.error('Failed to initialize database:', err);
});

// GET all hospitals and beds
app.get('/api/hospitals', (req, res) => {
  db.all(`SELECT * FROM hospitals`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// PUT update beds for a hospital
app.put('/api/hospitals/:id/beds', (req, res) => {
  const { id } = req.params;
  const { icuBedsAvailable, generalBedsAvailable } = req.body;
  
  db.run(
    `UPDATE hospitals SET icuBedsAvailable = ?, generalBedsAvailable = ? WHERE id = ?`,
    [icuBedsAvailable, generalBedsAvailable, id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ updated: this.changes });
    }
  );
});

// GET emergency history
app.get('/api/history', (req, res) => {
  db.all(`SELECT * FROM emergency_history ORDER BY id DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    // SQLite stores booleans as 1/0, convert back
    const formatted = rows.map(r => ({
      ...r,
      needsIcu: Boolean(r.needsIcu)
    }));
    res.json(formatted);
  });
});

// POST emergency history
app.post('/api/history', (req, res) => {
  const { patientName, emergencyType, sourceNodeId, needsIcu, primaryHospital, backupHospital, routeCost, algorithm, timestamp } = req.body;
  
  db.run(
    `INSERT INTO emergency_history (patientName, emergencyType, sourceNodeId, needsIcu, primaryHospital, backupHospital, routeCost, algorithm, timestamp) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [patientName, emergencyType, sourceNodeId, needsIcu ? 1 : 0, primaryHospital, backupHospital, routeCost, algorithm, timestamp],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// DELETE all history
app.delete('/api/history', (req, res) => {
  db.run(`DELETE FROM emergency_history`, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});
