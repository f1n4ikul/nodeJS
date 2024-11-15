const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 3000;

app.use(express.json());

const db = new sqlite3.Database('./db.sqlite', (err) => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err.message);
    } else {
        console.log('Подключено к базе данных SQLite.');
        db.run(`
            CREATE TABLE IF NOT EXISTS notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL UNIQUE,
                content TEXT,
                created TEXT NOT NULL,
                changed TEXT NOT NULL
            )
        `);
    }
});

app.get('/notes', (req, res) => {
    db.all(`SELECT * FROM notes`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка при получении заметок' });
        }
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Заметки не найдены' });
        }
        res.status(200).json(rows);
    });
});

app.get('/note/:id', (req, res) => {
    const { id } = req.params;
    db.get(`SELECT * FROM notes WHERE id = ?`, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка при поиске заметки' });
        }
        if (!row) {
            return res.status(404).json({ error: 'Заметка не найдена' });
        }
        res.status(200).json(row);
    });
});

app.get('/note/read/:title', (req, res) => {
    const { title } = req.params;
    db.get(`SELECT * FROM notes WHERE title = ?`, [title], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка при поиске заметки' });
        }
        if (!row) {
            return res.status(404).json({ error: 'Заметка не найдена' });
        }
        res.status(200).json(row);
    });
});

app.post('/note', (req, res) => {
    const { title, content } = req.body;
    const timestamp = new Date().toISOString();

    db.run(
        `INSERT INTO notes (title, content, created, changed) VALUES (?, ?, ?, ?)`,
        [title, content || '', timestamp, timestamp],
        function (err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(409).json({ error: 'Заметка с таким названием уже существует' });
                }
                return res.status(500).json({ error: 'Ошибка при создании заметки' });
            }

            res.status(201).json({
                id: this.lastID,
                title,
                content,
                created: timestamp,
                changed: timestamp
            });
        }
    );
});

app.delete('/note/:id', (req, res) => {
    const { id } = req.params;

    db.run(`DELETE FROM notes WHERE id = ?`, [id], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Ошибка при удалении заметки' });
        }
        if (this.changes === 0) {
            return res.status(409).json({ error: 'Заметка не найдена' });
        }
        res.sendStatus(204);
    });
});

app.put('/note/:id', (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    const timestamp = new Date().toISOString();

    db.run(
        `UPDATE notes SET title = ?, content = ?, changed = ? WHERE id = ?`,
        [title, content, timestamp, id],
        function (err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(409).json({ error: 'Заметка с таким названием уже существует' });
                }
                return res.status(500).json({ error: 'Ошибка при обновлении заметки' });
            }
            if (this.changes === 0) {
                return res.status(409).json({ error: 'Заметка не найдена' });
            }
            res.sendStatus(204);
        }
    );
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
