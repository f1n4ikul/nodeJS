const express = require('express');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = app.listen(3000, () => {
    console.log('Сервер работает на http://localhost:3000');
});

app.use(express.static(path.join(__dirname, 'public')));

const wss = new WebSocket.Server({ server });

let clients = [];
let usernames = [];

wss.on('connection', ws => {
    let username = null;
    let userColor = '#000000';

    ws.send('Добро пожаловать в чат! Пожалуйста, введите ваше имя и цвет сообщений в формате "Имя:Цвет".');

    clients.push(ws);

    ws.on('message', (message) => {
        message = message.toString();
        console.log("Получено сообщение от клиента:", message); 

        if (!username) {
            const [name, color] = message.split(':');
            username = name;
            userColor = color || '#000000'; 
            usernames.push(username);
            ws.send(`Добро пожаловать, ${username}! В чате уже присутствуют: ${usernames.join(', ')}`);
            broadcast(`${username} присоединился к чату.`, userColor);
        } else {
            broadcast(`${username}: ${message}`, userColor);
        }
    });

    ws.on('close', () => {
        if (username) {
            usernames = usernames.filter(user => user !== username);
            broadcast(`${username} покинул чат.`);
        }
        clients = clients.filter(client => client !== ws);
    });
});

function broadcast(message, color = '#000000') {
    console.log("Рассылаем сообщение:", message);

    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(`${message}:${color}`);
        }
    });
}
