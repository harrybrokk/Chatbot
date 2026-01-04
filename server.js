const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { GoogleGenAI } = require('@google/genai'); // Gemini Import
const config = require('./config'); 

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Gemini AI Initialization
const ai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
const model = "gemini-2.5-flash"; // Fast Model

app.use(express.static('public'));

io.on('connection', (socket) => {
    socket.on('chat-message', async (message) => {
        socket.emit('message', { user: 'You', text: message, type: 'sent' });

        try {
            const response = await ai.models.generateContent({
                model: model,
                contents: [{ role: 'user', parts: [{ text: message }] }],
            });

            const geminiResponse = response.text;
            
            socket.emit('message', { user: 'Gemini', text: geminiResponse, type: 'received' });

        } catch (error) {
            console.error('Gemini AI Error:', error);
            socket.emit('message', { user: 'System', text: 'Error: Connection failed. Check API Key.', type: 'system' });
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Gemini Hub Active on ${PORT}`));
