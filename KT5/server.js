const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

let notes = [];
let nextId = 1;

// GET /notes
app.get('/notes', (req, res) => {
    if (notes.length === 0) {
        return res.status(404).json({ message: 'No notes found' });
    }
    res.status(200).json(notes);
});

// GET /note/:id
app.get('/note/:id', (req, res) => {
    const note = notes.find(n => n.id === parseInt(req.params.id));
    if (!note) {
        return res.status(404).json({ message: 'Note not found' });
    }
    res.status(200).json(note);
});

// GET /note/read/:title
app.get('/note/read/:title', (req, res) => {
    const note = notes.find(n => n.title === req.params.title);
    if (!note) {
        return res.status(404).json({ message: 'Note not found' });
    }
    res.status(200).json(note);
});

// POST /note/
app.post('/note/', (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) {
        return res.status(409).json({ message: 'Title and content are required' });
    }

    const newNote = {
        id: nextId++,
        title,
        content,
        created: new Date(),
        changed: new Date()
    };

    notes.push(newNote);
    res.status(201).json(newNote);
});

// DELETE /note/:id
app.delete('/note/:id', (req, res) => {
    const index = notes.findIndex(n => n.id === parseInt(req.params.id));
    if (index === -1) {
        return res.status(409).json({ message: 'Note not found' });
    }

    notes.splice(index, 1);
    res.status(204).send();
});

// PUT /note/:id
app.put('/note/:id', (req, res) => {
    const index = notes.findIndex(n => n.id === parseInt(req.params.id));
    if (index === -1) {
        return res.status(409).json({ message: 'Note not found' });
    }

    const { title, content } = req.body;
    if (!title || !content) {
        return res.status(409).json({ message: 'Title and content are required' });
    }

    notes[index] = {
        ...notes[index],
        title,
        content,
        changed: new Date()
    };

    res.status(204).send();
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
