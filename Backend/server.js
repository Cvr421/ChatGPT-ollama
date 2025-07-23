// backend/server.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// // Database connection
// const pool = new Pool({
//     user: process.env.DB_USER || 'postgres',
//     host: process.env.DB_HOST || 'localhost',
//     database: process.env.DB_NAME || 'chatGPT',
//     password: process.env.DB_PASSWORD || 'postcvr',
//     port: process.env.DB_PORT || 5432,
// });


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Import routes
const chatRoutes = require('./routes/chat');
app.use('/api', chatRoutes);

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});


// app.use((req, res, next) => {
//     console.log("🔥 Incoming request:");
//     console.log("Method:", req.method);
//     console.log("Headers:", req.headers);
//     console.log("Body:", req.body);
//     next();
// });



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = { Pool };
