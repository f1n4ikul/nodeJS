const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { nanoid } = require('nanoid');

const app = express();
const PORT = 3000;

const db = new sqlite3.Database('./db.sqlite', (err) => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err.message);
    } else {
        console.log('Подключено к базе данных SQLite.');
        db.run(`
            CREATE TABLE IF NOT EXISTS urls (
                id TEXT PRIMARY KEY,
                original_url TEXT NOT NULL
            )
        `);
    }
});

app.get('/create', (req, res) => {
    const originalUrl = req.query.url;

    if (!originalUrl) {
        return res.status(400).json({ error: 'URL не указан' });
    }

    const shortId = nanoid(8);

    db.run(`INSERT INTO urls (id, original_url) VALUES (?, ?)`, [shortId, originalUrl], (err) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Ошибка при сохранении URL' });
        }

        const shortUrl = `${req.protocol}://${req.get('host')}/${shortId}`;
        res.json({ shortUrl });
    });
});

app.get('/:id', (req, res) => {
    const shortId = req.params.id;

    db.get(`SELECT original_url FROM urls WHERE id = ?`, [shortId], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Ошибка при поиске URL' });
        }

        if (row) {
            res.redirect(row.original_url);
        } else {
            res.status(404).json({ error: 'URL не найден' });
        }
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
