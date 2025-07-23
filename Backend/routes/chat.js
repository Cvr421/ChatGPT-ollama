// backend/routes/chat.js
const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const OLLAMA_API_URL = 'http://localhost:11434/api/generate';

// Import the database pool (corrected path)
const pool = require('./database'); // Note: using '../database' not './database'

// Add this debug line right after the import
console.log('Database connection object:', pool);
console.log('Is query function available?', typeof pool?.query === 'function');

// Store active streams for cancellation
const activeStreams = new Map();





// Create new chat
router.post('/chat', async (req, res) => {
    try {
        // Add defensive check
        if (!pool) {
            console.error('Database pool is undefined');
            return res.status(500).json({ error: 'Database connection failed' });
        }

        const chatId = uuidv4();
        const title = `Chat ${new Date().toLocaleString()}`;

        const result = await pool.query(
            'INSERT INTO chats (id, title) VALUES ($1, $2) RETURNING *',
            [chatId, title]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error creating chat:', error);
        res.status(500).json({ error: 'Failed to create chat' });
    }
});

// Get all chats
router.get('/chats', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM chats ORDER BY created_at DESC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({ error: 'Failed to fetch chats' });
    }
});

// Get chat by ID with messages
router.get('/chat/:chatId', async (req, res) => {
    try {
        const { chatId } = req.params;

        const chatResult = await pool.query(
            'SELECT * FROM chats WHERE id = $1',
            [chatId]
        );

        const messagesResult = await pool.query(
            'SELECT * FROM messages WHERE chat_id = $1 ORDER BY timestamp ASC',
            [chatId]
        );

        if (chatResult.rows.length === 0) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        res.json({
            ...chatResult.rows[0],
            messages: messagesResult.rows
        });
    } catch (error) {
        console.error('Error fetching chat:', error);
        res.status(500).json({ error: 'Failed to fetch chat' });
    }
});

// Send message and stream response
router.post('/chat/:chatId/message', async (req, res) => {
    try {
        const { chatId } = req.params;
        const { content } = req.body;

        // Save user message
        await pool.query(
            'INSERT INTO messages (chat_id, role, content) VALUES ($1, $2, $3)',
            [chatId, 'user', content]
        );

        // Update chat title if it's the first message
        const messageCount = await pool.query(
            'SELECT COUNT(*) FROM messages WHERE chat_id = $1',
            [chatId]
        );

        if (parseInt(messageCount.rows[0].count) === 1) {
            const autoTitle = content.length > 50 ?
                content.substring(0, 50) + '...' : content;
            await pool.query(
                'UPDATE chats SET title = $1 WHERE id = $2',
                [autoTitle, chatId]
            );
        }

        // Set up SSE
        res.writeHead(200, {
            'Content-Type': 'text/plain',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        });

        let assistantResponse = '';
        const controller = new AbortController();
        activeStreams.set(chatId, controller);

        try {
            const response = await axios.post(OLLAMA_API_URL, {
                model: 'gemma3:1b',
                prompt: content,
                stream: true,

                options: {
                    repeat_penalty: 1.15,    // Higher penalty for repetition
                    repeat_last_n: 128,      // Look back 128 tokens for repetition
                    top_k: 40,               // Limit token selection
                    top_p: 0.9,              // Nucleus sampling
                    temperature: 0.8,        // Slightly higher randomness
                    mirostat: 2,             // Enable mirostat sampling
                    mirostat_eta: 0.1,       // Mirostat learning rate
                    mirostat_tau: 5.0,       // Mirostat target entropy
                }



            }, {
                responseType: 'stream',
                signal: controller.signalcd
            });

            response.data.on('data', (chunk) => {
                const lines = chunk.toString().split('\n');

                for (const line of lines) {
                    if (line.trim()) {
                        try {
                            const data = JSON.parse(line);
                            if (data.response) {
                                assistantResponse += data.response;
                                res.write(data.response);
                            }
                        } catch (parseError) {
                            console.error('Parse error:', parseError);
                        }
                    }
                }
            });

            response.data.on('end', async () => {
                // Save assistant response
                await pool.query(
                    'INSERT INTO messages (chat_id, role, content) VALUES ($1, $2, $3)',
                    [chatId, 'assistant', assistantResponse]
                );

                activeStreams.delete(chatId);
                res.end();
            });

        } catch (error) {
            if (error.name === 'AbortError') {
                res.write('\n[STOPPED]');
            } else {
                console.error('Ollama error:', error);
                res.write('\n[ERROR: Failed to generate response]');
            }

            activeStreams.delete(chatId);
            res.end();
        }

    } catch (error) {
        console.error('Error in message route:', error);
        res.status(500).json({ error: 'Failed to process message' });
    }
});

// Stop streaming response
router.post('/chat/:chatId/stop', (req, res) => {
    const { chatId } = req.params;
    const controller = activeStreams.get(chatId);

    if (controller) {
        controller.abort();
        activeStreams.delete(chatId);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'No active stream found' });
    }
});

// Delete chat
router.delete('/chat/:chatId', async (req, res) => {
    try {
        const { chatId } = req.params;
        await pool.query('DELETE FROM chats WHERE id = $1', [chatId]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting chat:', error);
        res.status(500).json({ error: 'Failed to delete chat' });
    }
});

// Rename chat
router.put('/chat/:chatId', async (req, res) => {
    try {
        const { chatId } = req.params;
        const { title } = req.body;

        const result = await pool.query(
            'UPDATE chats SET title = $1 WHERE id = $2 RETURNING *',
            [title, chatId]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error renaming chat:', error);
        res.status(500).json({ error: 'Failed to rename chat' });
    }
});

module.exports = router;
