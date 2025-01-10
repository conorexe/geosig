const express = require('express');
const path = require('path');
const db = require('./config/db'); // Ensure this points to your database configuration

const app = express();
app.use(express.json());

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Redirect root ("/") to the index.html in the frontend folder
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// API routes
const urlRoutes = require('./routes/urls'); // Ensure this points to your URL API routes
app.use('/api/urls', urlRoutes);

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
