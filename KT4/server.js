const express = require('express');
const { Pool } = require('pg');
const shortid = require('shortid');

const app = express();
const PORT = process.env.PORT || 3000;


const pool = new Pool({
    user: 'postgres', 
    host: 'localhost',
    database: 'url_shortener',
    password: 'postgres', 
    port: 5432,
});

app.get('/create', async (req, res) => {
    const originalUrl = req.query.url;
    if (!originalUrl) {
        return res.status(400).send('URL is required');
    }

    const shortUrl = shortid.generate();

    try {
        const result = await pool.query(
            'INSERT INTO urls (original_url, short_url) VALUES (\$1, \$2) RETURNING *',
            [originalUrl, shortUrl]
        );

        res.send(`Сокращенный URL: http://localhost:${PORT}/${result.rows[0].short_url}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка при сохранении URL');
    }
});


app.get('/:shortUrl', async (req, res) => {
    const shortUrl = req.params.shortUrl;

    try {
        const result = await pool.query('SELECT * FROM urls WHERE short_url = \$1', [shortUrl]);

        if (result.rows.length > 0) {
            return res.redirect(result.rows[0].original_url);
        } else {
            return res.status(404).send('Сокращенный URL не найден');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка при получении URL');
    }
});


app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
