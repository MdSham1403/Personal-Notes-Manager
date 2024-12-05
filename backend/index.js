const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// Enable CORS for the frontend
app.use(cors());
app.use(express.json()); // Parse incoming JSON requests

// Set up SQLite database
const db = new sqlite3.Database('./notes.db', (err) => {
    if (err) {
        console.error('Error opening SQLite database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

// Create a notes table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT DEFAULT 'Others',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// Routes for CRUD operations

// Create a new note
app.post('/notes', (req, res) => {
    const { title, description, category } = req.body;
    const query = `INSERT INTO notes (title, description, category) VALUES (?, ?, ?)`;
    db.run(query, [title, description, category || 'Others'], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID });
    });
});

// Get all notes
app.get('/notes', (req, res) => {
    const query = `SELECT * FROM notes ORDER BY created_at DESC`;
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Update a note by ID
app.put('/notes/:id', (req, res) => {
    const { title, description, category } = req.body;
    const query = `UPDATE notes SET title = ?, description = ?, category = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    db.run(query, [title, description, category, req.params.id], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.status(200).json({ updated: this.changes });
    });
});

// Delete a note by ID
app.delete('/notes/:id', (req, res) => {
    const query = `DELETE FROM notes WHERE id = ?`;
    db.run(query, [req.params.id], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.status(200).json({ deleted: this.changes });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
