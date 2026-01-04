const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const Grok = require('@xai-foundation/grok-api');
const config = require('./config'); // Key ko import kiya

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Grok AI Initialization
const grok = new Grok({ apiKey: config.GROK_API_KEY });

app.use(express.static('public'));

io.on('connection', (socket) => {
    socket.on('chat-message', async (message) => {
        socket.emit('message', { user: 'You', text: message, type: 'sent' });

        try {
            const completion = await grok.chat.completions.create({
                model: 'grok-1.0',
                messages: [{ role: 'user', content: message }],
                temperature: 0.7,
            });

            const grokResponse = completion.choices[0].message.content;
            
            socket.emit('message', { user: 'Grok', text: grokResponse, type: 'received' });

        } catch (error) {
            socket.emit('message', { user: 'System', text: 'Error: Connection failed.', type: 'system' });
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Grok Hub Active on ${PORT}`));
